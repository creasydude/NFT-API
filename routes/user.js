import express from 'express';
import userAuth from '../middlewares/userAuth.js';
import { createNft, deleteNft, editNft, getOwnedNfts, getAllNfts, searchNft, addBalance, confirmAddBalance, showProfile, buyNft } from '../controllers/user.js';
const Router = express.Router();

//Single User Route
Router.get('/profile', userAuth, showProfile);
//Nft Route
Router.post('/createNft', userAuth, createNft);
Router.patch('/editNft/:tokenId', userAuth, editNft);
Router.delete('/deleteNft/:tokenId', userAuth, deleteNft);
Router.get('/getOwnedNfts', userAuth, getOwnedNfts);
//Buy and sell Route
Router.post('/buyNft', userAuth, buyNft);

//Balance Route
Router.post('/addBalance', userAuth, addBalance);
Router.post('/confirmAddBalance', confirmAddBalance);

//for all users
Router.get('/getAllNft', getAllNfts);
Router.post('/searchNft', searchNft);



export default Router;