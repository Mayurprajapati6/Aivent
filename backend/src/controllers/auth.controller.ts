import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// const generateToken = (id: string) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d'});
// };

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password){
            return res.status(400).json({ message: "Missing fields" });
        }

        const userExists = await User.findOne({ email });
        if(userExists) {
            return res.status(409).json({ message: 'User already registered'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const user = await User.create({ name, email, password: hashedPassword});

        const token = jwt.sign(
            { userId: String(user._id) },
            process.env.JWT_SECRET as string,
            { expiresIn: "30d" }
        );
        return res.status(201).json({
            token,
            user: { id: String(user._id), name: user.name, email: user.email },
        });

    } catch (error) {
        return res.status(500).json({ message: "Registration failed" });
    }
    
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: String(user._id) },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    return res.json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
};

export const getMe = async (req: any, res: Response) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};