const express = require("express");
const ctrl = require("../../controllers/contacts");
const router = express.Router();

router.get("/", ctrl.getAll);

router.get("/:id", ctrl.getById);

router.post("/", ctrl.postOne);

router.delete("/:id", ctrl.deleteOne);

router.put("/:id", ctrl.putOne);

module.exports = router;
