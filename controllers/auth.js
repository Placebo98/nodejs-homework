const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const {
  registerSchema,
  loginSchema,
  emailSchema,
} = require("../schema/joiSchema");
const { HttpError, sendEmail } = require("../helpers");
const { User } = require("../models/user.mongoose");
const { nanoid } = require("nanoid");
// const { BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarUrl = gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      verificationToken,
      avatarUrl,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<h1>Verify your email</h1> <a target="_blank" href="${process.env.BASE_URL}/users/verify/${verificationToken}">Click here to verify</a>`,
      text: `<h1>Verify your email</h1> <a target="_blank" href="${process.env.BASE_URL}/users/verify/${verificationToken}">Click here to verify</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw HttpError(401, "Email does not exist");
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "",
    });
    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const resendVerifyEmail = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne(email);
    if (!user) {
      throw HttpError(401, "missing required field email");
    }
    if (user.verify) {
      throw HttpError(401, "Verification has already been passed");
    }
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<h1>Verify your email</h1> <a target="_blank" href="${process.env.BASE_URL}/users/verify/${user.verificationToken}">Click here to verify</a>`,
      text: `<h1>Verify your email</h1> <a target="_blank" href="${process.env.BASE_URL}/users/verify/${user.verificationToken}">Click here to verify</a>`,
    };
    await sendEmail(verifyEmail);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }
    if (!user.verify) {
      throw HttpError(401, "Email not verified");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "23h",
    });
    await User.findByIdAndUpdate(user._id, { token }).exec();

    res.status(200).send({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;

    res.json(email, subscription);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.json({ message: "Logout success" });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  try {
    const resultUpload = path.join(avatarsDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, { avatarURL }).exec();

    res.json({ avatarURL });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateAvatar,
  verify,
  resendVerifyEmail,
};
