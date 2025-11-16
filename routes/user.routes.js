const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middleware/auth");

// Public
router.post("/signup", userController.signUp);
router.post("/login", userController.login);

// Protected
router.put("/update-profile", auth, userController.updateProfile);
router.get("/me", auth, userController.getProfile);

module.exports = router;
