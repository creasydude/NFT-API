import express from 'express';
import { config as dotenvConfig } from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import connectDB from './configs/connectDB.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoute from './routes/auth.js';
import userRoute from './routes/user.js';

//Deps
const app = express();
dotenvConfig({ path: ".env" });
connectDB();
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

//Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);

//Not found handler
app.use((_, res) => res.status(404).json({ success: false, message: "Not found" }));

//Error Handler
app.use(errorHandler);

//Listen
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT);
process.on('unhandledRejection', err => {
    console.log(err.message);
    server.close(() => process.exit(1));
});