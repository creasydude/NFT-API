import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter valid email"
        ]
    },
    otp: {
        type: String,
        default: null
    },
    otpExpire: {
        type: Date,
        default: null
    },
    ownedNfts: {
        type: Array,
        default: []
    },
    balance: {
        type: Number,
        default: 0
    }
});

userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("otp")) return next();
        const hashedOtp = await bcrypt.hash(this.otp, 10);
        this.otp = hashedOtp;
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.compareOtp = async function (otp) {
    try {
        return await bcrypt.compare(otp, this.otp);
    } catch (err) {
        throw err;
    }
};

userSchema.methods.getTokens = function () {
    const accessToken = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ _id: this._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
    return { accessToken, refreshToken };
}

const User = mongoose.model('User', userSchema);
export default User;
