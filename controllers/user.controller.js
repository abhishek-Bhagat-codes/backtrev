const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user.js"); // import your mongoose models

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  // ------------------------------------
  //  SIGN UP
  // ------------------------------------
  signUp: async (req, res) => {
    try {
      const { fullName, email, phoneNumber, password, aadhaarNumber } = req.body;

      // Check existing email/phone
      const existingUser = await User.findOne({
        $or: [{ email }, { phoneNumber }, { aadhaarNumber }]
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        aadhaarNumber,
      });

      await newUser.save();

      res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  LOGIN
  // ------------------------------------
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid email or password" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: "Invalid email or password" });

      const token = jwt.sign(
        { id: user._id },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  UPDATE PROFILE
  // ------------------------------------
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id; // coming from auth middleware
      const { fullName, phoneNumber, aadhaarNumber } = req.body;

      const updated = await User.findByIdAndUpdate(
        userId,
        {
          fullName,
          phoneNumber,
          aadhaarNumber
        },
        { new: true }
      );

      if (!updated) return res.status(404).json({ message: "User not found" });

      res.json({
        message: "Profile updated",
        user: updated
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  GET PROFILE (optional)
  // ------------------------------------
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};
