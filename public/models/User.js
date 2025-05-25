const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userImg: { type: String },
  firstName: String,
  lastName: String,
  username: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  emailConfirmed: { type: Boolean, default: false },
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { versionKey: false }, { collection: 'users' });

const User = mongoose.model('users', userSchema);

module.exports = User;
