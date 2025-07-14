const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users
// @desc    Add a new user
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    let user = await User.findOne({ name });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;