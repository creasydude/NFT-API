import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    payerId: {
        type: String,
        required: true
    },
    payLink: {
        type: String,
        required: true
    },
    verifyId: {
        type: String,
        default: null,
        required: true
    },
    success: {
        type: Boolean,
        default: false,
        required: true
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;