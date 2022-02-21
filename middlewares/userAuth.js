import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/ErrorResponse.js';
import User from '../models/User.js';

const userAuth = async (req, res, next) => {
    const token = req.get("Authorization");
    if (!token) return next(new ErrorResponse("Token not found", 401));
    try {
        const { _id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(_id);
        if (!user) return next(new ErrorResponse("User not found", 404));
        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

export default userAuth;