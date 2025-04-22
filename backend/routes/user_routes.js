import express from "express";
import jwt from "jsonwebtoken"; // No need to import SECRET_KEY, as it's already in `server.js` and passed as env
import multer from "multer";
const router = express.Router();
import User from "../model/user.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import dotenv from 'dotenv'
import { v2 as cloudinary } from "cloudinary";
dotenv.config()
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// console.log('env is ', process.env.GOOGLE_API_KEY)
// console.log("monog is ",process.env.PORT)
const inputPrompt = `
List all the clothing items visible in this image.
Format each item as:
* Item: Color
Only list items. Do not describe the background or image style.
`;

// Utility to parse text
function parseClothingList(text) {
  const items = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const match = line.match(/^\*\s*(\w+):\s*(.+)/);
    if (match) {
      items.push({ item: match[1].trim(), color: match[2].trim() });
    }
  }
  return items;
}

const authenticate = (req, res, next) => {
  const token = req.cookies.tokenlogin;
  // console.log("toke is ", token)
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // console.log(process.en.SECRET_KEY)
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("suser detail", decoded);
    req.user = decoded;
    console.log("user is ", req.user); // Attach the user object to the request
    next();
  } catch (error) {
    console.log("error");
    res.status(401).json({ msg: "Token is not valid" });
  }
};
router.get("/profile", (req, res) => {
  console.log("Cookies received:", req.cookies);
  const tokenlogin = req.cookies.tokenlogin;

  if (!tokenlogin) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(tokenlogin, process.env.SECRET_KEY); // You can use SECRET_KEY from environment
    return res.json({ message: "Success", user: decoded });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token", error });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("tokenlogin", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logout successful" });
});
router.get("/images", async (req, res) => {
  const tokenlogin = req.cookies.tokenlogin;
  if (!tokenlogin) {
    return res.status(401).json({ error: "No token provided" });
  }

  const decoded = jwt.verify(tokenlogin, process.env.SECRET_KEY); // You can use SECRET_KEY from environment
  req.user = decoded;
  // res.send(decoded)
  // console.log(req.user);
  try {
    const user = await User.findOne({ username: req.user.username }); // Fetch user from DB
    if (!user) return res.status(404).json({ error: "User not found" });

    // Convert filenames to full URLs
    const wardrobeImages = user.wardrobe;
    const wardrobeClothes = user.clothes;
    // console.log("all cloths", wardrobeClothes);
    const allClothes = [];
    let comma = false;
    let cloth = "";
    let k = 0;
    for (let i = 0; i < wardrobeClothes.length; i++) {
      let char = wardrobeClothes[i];
      if (char == ",") {
        allClothes[k++] = cloth.trim();
        cloth = "";
        continue;
      }
      cloth += char;
    }
    if (cloth) {
      allClothes[k++] = cloth.trim();
    }
    // console.log("allclothes", allClothes);
    const Wardrobe = {
      wardrobeImg: wardrobeImages,
      wardrobeClothes: wardrobeClothes,
      allclothes: allClothes,
    };
    res.json({ Wardrobe });
  } catch (error) {
    res.status(500).json({ error: "Error fetching Wardrobe" });
  }
});

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/upload-image",
  upload.single("wardrobeImage"),
  async (req, res) => {
    console.log("it is here");
    console.log(req.file);
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const token = req.cookies.tokenlogin;
      if (!token) return res.status(401).json({ error: "No token provided" });

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log("decoded data :", decoded);

      const user = await User.findOne({ username: decoded.username });
      if (!user) return res.status(404).json({ error: "User not found" });

      if (!user.wardrobe) user.wardrobe = [];

      let imageUrl;
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "uploads",
        });
        imageUrl = result.secure_url;
        console.log(imageUrl);
      } catch (error) {
        console.log("Image upload failed", error);
      }
      user.wardrobe.push(imageUrl);
      await user.save();

      res.json({ message: "Upload successful", imageUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed", details: error.message });
    }
  }
);

const memoryUpload = multer({ storage: multer.memoryStorage() });

router.post(
  "/classify-image",
  memoryUpload.single("wardrobeImage"),
  async (req, res) => {
    console.log('file details',req.file)
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      console.log("in try block")
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent([
        inputPrompt,
        {
          inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString("base64"),
          },
        },
      ]);
      // console.log(result);
      const responseText = result.response.text();
      if (typeof responseText !== "string") {
        return res.status(500).json({ error: "AI response is not a string" });
      }

      const clothingItems = parseClothingList(responseText);

      // Send back the classified items
      res.json({
        filename: file.originalname,
        clothing_items: clothingItems,
      });
    } catch (err) {
      console.error(`Error processing ${file.originalname}:`, err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
