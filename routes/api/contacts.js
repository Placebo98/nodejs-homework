const express = require("express");
const ctrl = require("../../controllers/contacts");
const router = express.Router();
const { authenticate } = require("../../midlewares");

router.get("/", authenticate, ctrl.getAll);

router.get("/:id", authenticate, ctrl.getById);

router.post("/", authenticate, ctrl.postOne);

router.delete("/:id", authenticate, ctrl.deleteOne);

router.put("/:id", authenticate, ctrl.putOne);

router.patch("/:id/favorite", authenticate, ctrl.updateStatusContact);

module.exports = router;
