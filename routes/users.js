const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');


mongoose.connect('mongodb://127.0.0.1:27017/pinterest-clone');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  profileImage: {
    type: String
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  contact: {
    type: Number,
  },
  boards: {
    type: Array,
    default: []
  },
  posts:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post'
    }
  ]
});
userSchema.plugin(plm);

const User = mongoose.model('user', userSchema);

module.exports = User;
