const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClaimHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pointsClaimed: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// arshlank894
// b4RBZ7jhASUTg42j

module.exports = mongoose.model('ClaimHistory', ClaimHistorySchema);