import express from "express";
import { otpAuth, otpValidate, refreshToken, editProfile , confirmEditProfile } from '../controllers/auth.js';
import userAuth from "../middlewares/userAuth.js";
const Router = express.Router();

Router.post("/otpAuth", otpAuth);
Router.post("/otpValidate", otpValidate);
Router.get("/refreshToken", refreshToken);
Router.post("/editProfile", userAuth, editProfile);
Router.patch("/confirmEditProfile", userAuth, confirmEditProfile);

export default Router;