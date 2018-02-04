const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  facebookID: String,
  googleID: String,
  description: String,
  recepies: {
    type: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recepies'
        }
    ],
    default: []
  },
  role: {
    type: String,
    enum : ['USER', 'ADMIN'],
    default : 'USER'
  }
}, { timestamps: true });



const User = mongoose.model('User', userSchema);
module.exports = User;