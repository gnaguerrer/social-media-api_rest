const { Schema, model } = require('mongoose');
const mongoosePagination = require('mongoose-paginate-v2');

const FollowSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  followed: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

FollowSchema.plugin(mongoosePagination);

module.exports = model('Follow', FollowSchema, 'follows');
