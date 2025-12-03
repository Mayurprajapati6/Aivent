import express from "express"
import { getMe, loginUser, registerUser } from "../../controllers/auth.controller";
import { protect } from "../../middlewares/auth.middleware";

const authRouter = express.Router();

authRouter.post('/register', registerUser);
//authRouter.post('/login', (req, res, next) => { void loginUser(req, res).catch(next); }); // when you return from the controller then use should use this 
authRouter.post('/login', loginUser)
authRouter.get('/me', protect, getMe);

export default authRouter;

