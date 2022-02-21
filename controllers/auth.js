import ErrorResponse from "../utils/ErrorResponse.js";
import sucResponse from "../utils/sucResponse.js";
import { compareTime } from '../utils/time.js';
import jwt from 'jsonwebtoken';
import User from "../models/User.js"
import OTP from '../utils/otp.js';

export const otpAuth = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new ErrorResponse("Please provide email ", 400));
    await OTP(res, next, { email });
}

export const otpValidate = async (req, res, next) => {
    const { email, otp } = req.body;
    if (!email || !otp) return next(new ErrorResponse("Please provide email and otp", 400));
    try {
        const user = await User.findOne({ email });
        if (!user) return next(new ErrorResponse("User not found", 404));
        if (await user.compareOtp(otp)) {
            if (user.otpExpire && !compareTime(user.otpExpire)) return next(new ErrorResponse("OTP expired, get new OTP", 400));
            const { accessToken, refreshToken } = user.getTokens();
            res.cookie("Authorization", refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });
            sucResponse(res, 200, { message: "OTP validated", accessToken });
        } else {
            return next(new ErrorResponse("OTP not matched", 400));
        }
    } catch (err) {
        next(err)
    }

}

export const refreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.Authorization;
    if (!refreshToken) return next(new ErrorResponse("Token not found", 401));
    try {
        const { _id } = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        const user = await User.findById(_id);
        if (!user) return next(new ErrorResponse("User not found", 404));
        const { accessToken } = user.getTokens();
        sucResponse(res, 200, { message: "Token refreshed", accessToken });
    } catch (err) {
        next(err);
    }

}

export const editProfile = async (req, res, next) => {
    const { _id } = req.user;
    await OTP(res, next, { _id });
}

export const confirmEditProfile = async (req, res, next) => {
    const { email, otp } = req.body;
    const { _id } = req.user;
    if (!email || !otp) return next(new ErrorResponse("Please provide email and otp", 400));
    try {
        const user = await User.findById({ _id });
        const existingUser = await User.findOne({ email });
        if (!user) return next(new ErrorResponse("User not found", 404));
        if (user.email === email ) return next(new ErrorResponse("Email not changed", 400));
        if (existingUser) return next(new ErrorResponse("Email already exists", 400));
        if (await user.compareOtp(otp)) {
            if (user.otpExpire && !compareTime(user.otpExpire)) return next(new ErrorResponse("OTP expired, get new OTP", 400));
            const { _id } = req.user;
            const updatedUser = await User.findByIdAndUpdate(_id, { email });
            sucResponse(res, 200, { message: "Profile updated" });
        } else {
            return next(new ErrorResponse("OTP not matched", 400));
        }
    } catch (err) {
        next(err);
    }
}