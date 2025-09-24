import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
email: { type: String, required: true, unique: true },
firstName: { type: String, required: true, unique: false },
lastName: { type: String, required: true, unique: false },
phone: { type: String, required: true, unique: true },
organization: { type: String, required: true, unique: false },
location: { type: String, required: true, unique: false },
agreeTerms: { type: Boolean, default: false },

password: { type: String, required: true },
createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model('User', userSchema);

export default User;