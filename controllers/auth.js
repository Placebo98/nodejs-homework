const { registerSchema, loginSchema } = require("../schema/joiSchema");
const { HttpError } = require("../helpers");
const { User } = require("../models/user.mongoose");

const register = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, "Email in use");
    }
    const newUser = await User.create(req.body);
    res.status(201).json({
      email: newUser.email,
      password: newUser.password,
      subscription: newUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register };
