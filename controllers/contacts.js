const { schema } = require("../schema/joiSchema");
// const contacts = require("../models/contacts");
const { HttpError } = require("../helpers");
const { Contact } = require("../models/contacts.mongoose");

const getAll = async (req, res, next) => {
  try {
    const result = await Contact.find();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Contact.findById(id);
    if (!result) {
      throw HttpError(404, "Not Found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const postOne = async (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    console.log(error);
    if (error) {
      throw HttpError(404, error.message);
    }
    const result = await Contact.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Contact.findByIdAndDelete(id);
    if (!result) {
      throw HttpError(404, "Not Found");
    }
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const putOne = async (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    console.log(error);
    if (error) {
      throw HttpError(404, error.message);
    }
    const { id } = req.params;
    const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });
    if (!result) {
      throw HttpError(404, "Not Found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, postOne, getById, putOne, deleteOne };
