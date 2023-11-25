const express = require("express");
const ctrl = require("../../controllers/auth");
const router = express.Router();
const { authenticate, upload } = require("../../midlewares");

//signup
router.post("/register", ctrl.register);

//signin
router.post("/login", ctrl.login);

router.get("/current", authenticate, ctrl.getCurrent);

router.post("/logout", authenticate, ctrl.logout);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatars"),
  ctrl.updateAvatar
);

module.exports = router;
