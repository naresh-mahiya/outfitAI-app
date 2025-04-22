import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/user.js';

const router = express.Router();

// Test route
router.get('/', (req, res) => {
  res.send('Hello World');
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.cookies.tokenlogin;
console.log('toke is ',token)
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Invalid token");
    res.status(401).json({ msg: "Token is not valid" });
  }
};
  
// Protected route
router.get("/profile", authenticate, async (req, res) => {
    console.log("profiule secioptn")
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select('-password'); 
    if (!user) return res.status(404).json({ msg: "User not found" });
    console.log(user)
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
