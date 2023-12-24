const { Schema, model } = require('mongoose');
const mongoosePagination = require('mongoose-paginate-v2');

const PublicationSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  text: {
    type: String,
    required: true
  },
  file: {
    type: String,
    default: 'default.png'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

PublicationSchema.plugin(mongoosePagination);

module.exports = model('Publication', PublicationSchema, 'publications');
