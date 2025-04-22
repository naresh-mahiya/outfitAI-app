import express from 'express'
import path from 'path'
const router=express.Router()
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import jwt from 'jsonwebtoken';
import User from './user.js'
import dotenv from 'dotenv';
dotenv.config();


router.post("/register",async (req,res)=>{
    console.log('user login info : ' , (req.body))
    const {username,email,password}=req.body 
    console.log(username,email,password)
    const profileImage=`https://api.dicebear.com/7.x/initials/svg?seed=${username}`
    const user=await User.create({username:username,email:email,password:password,profileImageURL:profileImage})
    if (!user){
        res.status(400).send({message:'User not created'})
    }
    res.json({Newuser:user})
})

router.post("/login",async (req,res) => {
    // console.log("login trieed")
    console.log(req.body)
    const {email,password}=req.body 
    const user=await User.findOne({email:email})
    if (!user){
        res.status(404).json({msg : 'No user found with given email'})
        return
    }
    // console.log(user)
    const passwordindb = req.body.password 
    if (passwordindb===user.password){
        const SECRET_KEY=process.env.SECRET_KEY
        const token=jwt.sign({username:user.username,id:user._id,email:email,profilePicture:user.profileImageURL},SECRET_KEY,{expiresIn:'24h'})
        console.log(token)
        res.cookie('tokenlogin', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          });
          
        res.status(200).json({message:"user logged in " , token})
    }
    else{
        res.status(404).json({msg:"Incorrect password"})
    }
})

export default router