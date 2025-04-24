import express from "express";
import jwt from "jsonwebtoken"; // No need to import SECRET_KEY, as it's already in `server.js` and passed as env
import multer from "multer";
const router = express.Router();
import User from "../model/user.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();
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

      res.json({ message: "Upload successful", imageUrl,token });
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
    console.log("file details", req.file);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      console.log("in try block");
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
      const tokenlogin = req.cookies.tokenlogin;
      const userid = jwt.verify(tokenlogin, process.env.SECRET_KEY).id;

      const clothingItems = parseClothingList(responseText);
      const user = await User.findById(userid);
      // console.log(user);
      // user.clothes.push(clothingItems)
      let allclothes=''
      for (let i=0;i<clothingItems.length;i++){
        const usercloth=clothingItems[i].item + " " + clothingItems[i].color
        // console.log(usercloth)
        allclothes += usercloth + "; ";
      }
      user.clothes.push(allclothes);
      await user.save()
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


router.get("/getclothes",authenticate,async (req,res)=>{
console.log(req.user)
const user = await User.findById(req.user.id);
res.json({ clothes: user.clothes });
})

router.post("/update-profile",authenticate,async (req,res)=>{
  const {age,gender,preferences} = req.body;
  const user = await User.findById(req.user.id);
  user.age = age;
  user.gender = gender;
  user.preferences = preferences;
  await user.save();
  res.json({ message: "Profile updated successfully" });
})

router.post("/change-password", authenticate, async (req, res) => {
  try {
    console.log('Change password request received:', req.body);
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      // Import bcrypt dynamically if not available globally
      const bcrypt = await import('bcrypt');
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      await user.save();
      
      console.log('Password changed successfully for user:', user.email);
      res.json({ message: "Password changed successfully" });
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      
      // Alternative approach without bcrypt (less secure but functional)
      if (user.password !== currentPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      user.password = newPassword;
      await user.save();
      
      console.log('Password changed successfully (without bcrypt) for user:', user.email);
      res.json({ message: "Password changed successfully" });
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
})

router.post("/addnewcloths", authenticate, async (req, res) => {
  const userid = req.user.id;
  console.log(req.body);
  const user = await User.findById(userid);
  const clothdata = req.body.clothname;
  if (user.clothes[0]) {
    console.log("saved");
    user.clothes[0] += `\n , ${clothdata} , `;
  } else {
    console.log("not saved");
    user.clothes[0] = clothdata + " ";
  }
  await user.save();

  res.json({ message: "cloth saved to the user" });
});
router.post("/cloth/lovesuggestion/save", authenticate, async (req, res) => {
  const userid = req.user.id;
  // console.log(userid);
  const cloths = req.body.clothsuggestion;
  console.log(cloths);
  const user = await User.findById(userid);
  if (!user) {
    res.status(404).json({ msg: "no user found" });
    return;
  }
  if (!user.favourites.includes(cloths)) {
    user.favourites.push(cloths);
  }

  await user.save();
  res.status(200).json({ msg: "Suggestion saved to favourites" });
});

router.get("/clothsforweek", authenticate, async (req, res) => {
  const userid = req.user.id;

  try {
    const user = await User.findById(userid);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const clothforweekdata = user.clothessuggestionforweek;
    const favourites = user.favourites;
    res.json({ clothforweek: clothforweekdata, favourites: favourites });
  } catch (err) {
    console.error("Error fetching clothes for week:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/copytoprofileweekcloths", authenticate, async (req, res) => {
  const userid = req.user.username;
  console.log("User details of clothes:", userid);

  const user = await User.findOne({ username: userid }); // <- changed to findOne
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // console.log('User is final:', user);
  // console.log('Weekly clothes to save:', req.body.clothesforweek);

  user.clothessuggestionforweek = req.body.clothesforweek;
  await user.save();

  res.status(200).json({ message: "Weekly clothing suggestion saved!" });
});


router.get("/getuserdetails", authenticate, async (req, res) => {
  const userid = req.user.id;
  const user = await User.findById(userid);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    age: user.age,
    preferences: user.preferences,
    gender: user.gender,
  });
});

export default router;