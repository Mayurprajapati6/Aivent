import express from "express"
import { getMe, loginUser, registerUser, updateUser } from "../../controllers/auth.controller";
import { protect } from "../../middlewares/auth.middleware";

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser)
authRouter.get('/me', protect, getMe);
authRouter.put('/me', protect, updateUser);

export default authRouter;

