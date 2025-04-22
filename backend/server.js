import express from 'express';
import authRoutes from './routes/auth_routes.js';
import connect from './db/connection.js';
import profileRoutes from './routes/profilebackend.js'
import cookieParser from 'cookie-parser';

const app = express();

import dotenv from 'dotenv'
dotenv.config()
const mongourl=process.env.MONGO_URI
app.use(cookieParser())
app.use(cookieParser());
 
app.use(express.json());

app.get("/", (req, res) => {
    res.send("this is listening");
});

connect(mongourl);

app.use("/auth", authRoutes);
app.use("/user",profileRoutes)
app.listen(3000, () => {
    console.log("Server is running on port 3000");
    console.log("http://localhost:3000");
});
