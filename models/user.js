const mongoose = require('mongoose');
const { model } = mongoose;
const UserSchema = require('../schemas/userSchema');

const User = model('User', UserSchema);

module.exports = {
  User
};
