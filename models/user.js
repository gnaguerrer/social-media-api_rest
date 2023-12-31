const { Schema, model } = require('mongoose');
const mongoosePagination = require('mongoose-paginate-v2');

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  surname: String,
  nickname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  bio: String,
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'role_user'
  },
  image: {
    type: String,
    default: 'default.png'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

UserSchema.plugin(mongoosePagination);

module.exports = model('User', UserSchema, 'users');
