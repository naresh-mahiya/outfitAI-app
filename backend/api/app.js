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
// import GoogleLoginRoutes from '../routes/auth.google.js';
// import facebookRoutes from '../routes/auth.facebook.js'
import ShopRoutes from '../routes/shop.routes.js';
import Chatbot from '../routes/chat.js';
import ShareRoutes from '../routes/share.js';
import imageGenerateRoute from '../routes/image.js';
import profileRoutes from '../routes/profilebackend.js'; // 👈 Added from second file
import path from 'path';
import cors from 'cors';
import connectCloudinary from '../db/cloudinary.js';
import multer from 'multer';

const frontendUrl = process.env.FRONTEND_URL;
const mongoUri = process.env.MONGO_URI;

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: frontendUrl,
    credentials: true,
  },
});

export { io };

app.use(cookieParser());
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/uploadscloths", express.static(path.join(path.resolve(), "uploadscloths")));



// Routes
app.use("/chat", Chatbot);
app.use("/user", UserRoutes);
app.use("/auth", AuthRoutes);
app.use("/shop", ShopRoutes);
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

// Socket.io logic
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("join_room", (username) => {
    onlineUsers[username] = socket.id;
    console.log(`${username} joined`);
  });

  socket.on("send_message", (data) => {
    const { sender, recipient, message } = data;
    const receiverSocketId = onlineUsers[recipient];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", { sender, message });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    for (let [key, value] of Object.entries(onlineUsers)) {
      if (value === socket.id) {
        delete onlineUsers[key];
      }
    }
  });
});



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a timestamp and original extension
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


// Server listening
const PORT = process.env.PORT || 3000;
const ipaddress='192.168.137.233'
console.log(mongoUri)
const main=async()=>{
  await connectCloudinary();
  await connect(mongoUri); 
  httpServer.listen(PORT, () => {
    console.log(`Server listening on http://${ipaddress}:${PORT}`);
  });
}

main()

export default app;