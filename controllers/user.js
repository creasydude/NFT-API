import Nft from "../models/Nft.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import sucResponse from "../utils/sucResponse.js";
import { v4 as uuidv4 } from 'uuid';

export const createNft = async (req, res, next) => {
    const { name, description, image, price } = req.body;
    if (!name || !description || !image || !price) return next(new ErrorResponse("Please provide name, description, image and price", 400));
    try {
        const owner = req.user._id;
        // u can implant the ethereum contract here its just a simple example
        const tokenId = uuidv4();
        const nft = await Nft.create({ name, description, image, price, owner, tokenId });
        sucResponse(res, 200, { message: "Nft created", nft });
    } catch (err) {
        next(err);
    }
};

export const editNft = async (req, res, next) => {
    const { name, description, price } = req.body;
    const { tokenId } = req.params;
    const owner = req.user._id;
    if (!tokenId) return next(new ErrorResponse("Please provide tokenId", 400));
    try {
        const nft = await Nft.findOne({ tokenId });
        if (!nft) return next(new ErrorResponse("Nft not found", 404));
        if (nft.owner !== owner) return next(new ErrorResponse("You are not authorized to edit this Nft", 400));
        if (name) nft.name = name;
        if (description) nft.description = description;
        if (price) nft.price = price;
        await nft.save();
        sucResponse(res, 200, { message: "Nft updated", nft });
    } catch (err) {
        next(err);
    }
};

export const deleteNft = async (req, res, next) => {
    const { tokenId } = req.params;
    const owner = req.user._id;
    if (!tokenId) return next(new ErrorResponse("Please provide tokenId", 400));
    try {
        const nft = await Nft.findOne({ tokenId });
        if (!nft) return next(new ErrorResponse("Nft not found", 404));
        if (nft.owner !== owner) return next(new ErrorResponse("You are not authorized to edit this Nft", 400));
        await nft.remove();
        sucResponse(res, 200, { message: "Nft deleted" });
    } catch (err) {
        next(err);
    }
};

export const getOwnedNfts = async (req, res, next) => {
    let { page, limit } = req.query;
    if (!page) page = 0;
    if (!limit) limit = 5;
    const owner = req.user._id;
    try {
        const nfts = await Nft.find({ owner }).skip(page * limit).limit(limit);
        const count = await Nft.countDocuments({ owner });
        sucResponse(res, 200, { message: "Nfts fetched", nfts, count });
    } catch (err) {
        next(err);
    }
};

// for all users
export const getAllNfts = async (req, res, next) => {
    let { page, limit } = req.query;
    if (!page) page = 0;
    if (!limit) limit = 5;
    try {
        const nfts = await Nft.find().skip(page * limit).limit(limit);
        const count = await Nft.countDocuments();
        sucResponse(res, 200, { message: "Nfts fetched", nfts, count });
    } catch (err) {
        next(err);
    }
}

export const searchNft = async (req, res, next) => {
    let { page, limit } = req.query;
    if (!page) page = 0;
    if (!limit) limit = 5;
    const { name } = req.query;
    if (!name) return next(new ErrorResponse("Please provide name", 400));
    try {
        const nfts = await Nft.find({ "name": { "$regex": name, "$options": "i" } }).skip(page * limit).limit(limit);
        const count = await Nft.countDocuments({ "name": { "$regex": name, "$options": "i" } });
        sucResponse(res, 200, { message: "Nfts fetched", nfts, count });
    } catch (err) {
        next(err);
    }
}

export const addBalance = async (req, res, next) => {
    const orderId = Math.floor(Math.random() * 1000000000);
    const payerId = req.user._id;
    const { amount } = req.body;
    if (!amount) return next(new ErrorResponse("Please provide amount balance", 400));
    try {
        //you should implant the payment gateway here and get the link of payment + id from payment api , its fake here
        const payLink = "https://www.pay.com/" + orderId;
        const verifyId = uuidv4();
        // that 2 variables are example
        const transaction = await Transaction.create({ orderId, payerId, amount, payLink, verifyId });
        sucResponse(res, 200, { message: "Transaction created.", transaction });
    } catch (err) {
        next(err);
    }
}

export const confirmAddBalance = async (req, res, next) => {
    //this is the route you send payment id to payment api then it verify the payment and update the transaction
    const { verifyId , status } = req.body;
    if (!verifyId) return next(new ErrorResponse("Please provide verifyId", 400));
    try {
        //you send the verify id to payment api it verifies the payment and update the transaction so code below is just an example
        //for example status 100 is success
        if (status != 100) return next(new ErrorResponse("Payment failed", 400));
        const transaction = await Transaction.findOne({ verifyId });
        const user = await User.findById(transaction.payerId);
        if (!user) return next(new ErrorResponse("User not found", 404));
        if (!transaction) return next(new ErrorResponse("Transaction not found", 404));
        if (transaction.success) return next(new ErrorResponse("Transaction already completed", 400));
        transaction.success = true;
        user.balance += transaction.amount;
        await transaction.save();
        await user.save();
        sucResponse(res, 200, { message: "Transaction completed , balance added successfuly" });
    } catch (err) {
        next(err);
    }
};

export const showProfile = async (req, res, next) => {
    const userId = req.user._id;
    if (!userId) return next(new ErrorResponse("Please provide userId", 400));
    try {
        let user = await User.findById(userId);
        if (!user) return next(new ErrorResponse("User not found", 404));
        sucResponse(res, 200, { message: "User fetched", user });
    } catch (err) {
        next(err);
    }
}

export const buyNft = async (req, res, next) => {
    const { tokenId } = req.params;
    const userId = req.user._id;
    if (!tokenId) return next(new ErrorResponse("Please provide tokenId", 400));
    if (!userId) return next(new ErrorResponse("Please provide userId", 400));
    try {
        const user = await User.findById(userId);
        if (!user) return next(new ErrorResponse("User not found", 404));
        const nft = await Nft.findOne({ tokenId });
        if (!nft) return next(new ErrorResponse("Nft not found", 404));
        if (nft.owner === userId) return next(new ErrorResponse("You already own this Nft", 400));
        if (user.balance < nft.price) return next(new ErrorResponse("You don't have enough balance", 400));
        user.balance -= nft.price;
        nft.owner = userId;
        await user.save();
        sucResponse(res, 200, { message: "Nft purchased successfuly" });
    } catch (err) {
        next(err);
    }
}