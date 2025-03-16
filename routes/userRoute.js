import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/login', loginUser);  // POST /api/users/login
userRouter.post('/register', registerUser);  // POST /api/users/register

export default userRouter;