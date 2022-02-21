import User from "../models/User.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import sucResponse from "../utils/sucResponse.js";
import { addTime, compareTime } from '../utils/time.js';

const otp = async (res, next, data) => {
    const generatedOtp = Math.floor(Math.random() * 100000);
    const { email, _id } = data;
    const otpTime = 1;
    let user;
    try {
        if (email) user = await User.findOne({ email });
        if (_id) user = await User.findById({ _id });
        if (!data) return next(new ErrorResponse("Please provide email or _id", 400));
        if (user) {
            if (user.otpExpire && compareTime(user.otpExpire)) return next(new ErrorResponse("OTP exist , try again later", 400));
            user.otp = generatedOtp;
            user.otpExpire = addTime(otpTime);
            await user.save();
            sucResponse(res, 200, { message: "OTP sent to email" });
            //otp to email logic here
            if (process.env.NODE_ENV !== "production") console.log(`OTP for ${email} is ${generatedOtp}`);
        } else {
            const newUser = new User({
                email,
                otp: generatedOtp,
                otpExpire: addTime(otpTime),
            });
            await newUser.save();
            sucResponse(res, 201, { message: "User created , OTP sent to email" });
            //otp to email logic here
            if (process.env.NODE_ENV !== "production") console.log(`OTP for ${email} is ${generatedOtp}`);
        }
    } catch (err) {
        next(err);
    }

}

export default otp;