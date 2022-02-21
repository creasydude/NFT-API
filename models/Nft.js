import mongoose from 'mongoose';
const nftSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    owner: {
        type: String,
        required: true
    }

})

const Nft = mongoose.model('Nft', nftSchema);

export default Nft;