import express from 'express';
import authRoutes from './auth.routes.js';
import connect from './connection.js';
import profileRoutes from './profilebackend.js'
import cookieParser from 'cookie-parser';
const app = express();
app.use(cookieParser())
app.use(cookieParser());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("this is listening");
});

connect("mongodb://localhost:27017/appWardrobe");

app.use("/auth", authRoutes);
app.use("/user",profileRoutes)
app.listen(3000, () => {
    console.log("Server is running on port 3000");
    console.log("http://localhost:3000");
});
