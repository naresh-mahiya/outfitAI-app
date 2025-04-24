// server.js

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connect from '../db/connection.js';
import cookieParser from 'cookie-parser';

import UserRoutes from '../routes/user_routes.js';
import AuthRoutes from '../routes/auth_routes.js';
import Chatbot from '../routes/chat.js';
import ShareRoutes from '../routes/share.js';
import imageGenerateRoute from '../routes/image.js';
import profileRoutes from '../routes/profilebackend.js';
import path from 'path';
import cors from 'cors';
import connectCloudinary from '../db/cloudinary.js';
import multer from 'multer';

const frontendUrl = process.env.FRONTEND_URL;
const mongoUri = process.env.MONGO_URI;

const app = express();
const httpServer = http.createServer(app);


app.use(cookieParser());
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/uploadscloths", express.static(path.join(path.resolve(), "uploadscloths")));
app.use("/chat", Chatbot);
app.use("/user", UserRoutes);
app.use("/auth", AuthRoutes);
app.use("/share", ShareRoutes);
app.use("/imagegenerate", imageGenerateRoute);
app.use("/profile", profileRoutes);

import clothidentification from '../routes/clothid.js';
app.use("/clothid", clothidentification);

app.get("/", (req, res) => {
  res.send("This is the main page");
});
app.get("/imageuploading",(req,res)=>{
  console.log("done")
  res.send("Image uploading endpoint")
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

app.post("/imageuploading", upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  console.log("File uploaded:", req.file);
  res.send("Image uploaded successfully");
});
const PORT = process.env.PORT || 3000
const ipaddress='192.168.104.140'
const main=async()=>{
  await connectCloudinary();
  await connect(mongoUri); 
  httpServer.listen(PORT, () => {
    console.log(`Server listening on http://${ipaddress}:${PORT}`);
  });
}

main()

export default app;