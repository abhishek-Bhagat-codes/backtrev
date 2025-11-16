const { SafetyScore } = require("../models/safetyScore.js");

module.exports = {
  // ------------------------------------
  //  FETCH SAFETY SCORE
  // ------------------------------------
  fetchSafetyScore: async (req, res) => {
    try {
      const userId = req.user.id;

      const safetyScore = await SafetyScore.findOne({ userId });
      if (!safetyScore) {
        return res.status(404).json({ message: "Safety score not found" });
      }

      res.json({ safetyScore });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};

