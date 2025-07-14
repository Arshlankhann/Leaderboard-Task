const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ClaimHistory = require('../models/ClaimHistory');

// Function to update ranks
const updateRanks = async () => {
  const users = await User.find().sort({ points: -1 });
  for (let i = 0; i < users.length; i++) {
    await User.findByIdAndUpdate(users[i]._id, { rank: i + 1 });
  }
};

// @route   POST /api/claim
// @desc    Claim points for a user
router.post('/claim', async (req, res) => {
  const { userId } = req.body;
  const randomPoints = Math.floor(Math.random() * 10) + 1;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points: randomPoints } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Create a history record
    const history = new ClaimHistory({
      userId,
      pointsClaimed: randomPoints,
    });
    await history.save();
    
    // Update all user ranks
    await updateRanks();

    // Fetch the updated leaderboard
    const leaderboard = await User.find().sort({ rank: 1 });
    res.json(leaderboard);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/leaderboard
// @desc    Get the leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    await updateRanks(); // Ensure ranks are up-to-date
    const leaderboard = await User.find().sort({ rank: 1 });
    res.json(leaderboard);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/history
// @desc    Get all claim history
router.get('/history', async (req, res) => {
    try {
        const history = await ClaimHistory.find().populate('userId', 'name').sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;