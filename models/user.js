const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 18 },
    email: { type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] },
    mobile: { type: String, match: [/^\d{10}$/, 'Mobile number must be 10 digits'] },
    address: { type: String, required: true, trim: true },
    aadharCardNumber: { type: String, required: true, unique: true, match: [/^\d{12}$/, 'Aadhar number must be exactly 12 digits'] },
    password: { type: String, required: true },
    role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
    isVoted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false } // ✅ NEW
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) { next(err); }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('user', userSchema);
module.exports = User;