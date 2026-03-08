const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * User Schema
 */
const UserSchema = new Schema({
  fullName:         { type: String, required: true, trim: true },
  phoneNumber:      { type: String, required: true, unique: true, trim: true },
  email:            { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:         { type: String, required: true }, // hash passwords before save
  aadhaarNumber:    { type: String, unique: true, sparse: true, trim: true },
  role:             { type: String, enum: ['tourist','police','admin'], default: 'tourist' },
  createdAt:        { type: Date, default: Date.now }
}, {
  collection: 'users',
});

UserSchema.index({ phoneNumber: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true }); 

module.exports = UserSchema;

