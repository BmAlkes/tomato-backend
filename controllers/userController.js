import userModel from "../models/user.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

//Login User

 const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      //Check if user exists
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(400).json({success:false, message: "User Doesn't exist " });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({success:false, message: "Invalid Credentials" });
      }

        const token = createToken(user._id);
        res.status(200).json({ success: true, token });
    }catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
 };


const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
}
//Register User

 const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    //Check if user already exists
    const exists = await userModel.findOne({ email });

    if(exists){
      return res.status(400).json({success:false,message:"User already exists"})
    }

    //Validate email
    if(!validator.isEmail(email)){
      return res.status(400).json({success:false,message:"Please enter a valid email"})
    }
    if(password.length < 8){
      return res.status(400).json({success:false,message:"Password must be atleast 6 characters long"})
    }


    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.status(201).json({ success: true, token });
  

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export { loginUser, registerUser };


