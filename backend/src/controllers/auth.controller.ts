import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// const generateToken = (id: string) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d'});
// };

export async function  registerUser (req: Request, res: Response) {
    try {
        if (!req.body) {
          res.status(400).json({ message: "Request body is missing" });
            
        }
        const { name, email, password } = req.body;

        if (!name || !email || !password){
          res.status(400).json({ message: "Missing fields" });
          
        }

        const userExists = await User.findOne({ email });
        if(userExists) {
          res.status(409).json({ message: 'User already registered'});
  
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const user = await User.create({ name, email, password: hashedPassword});

        const token = jwt.sign(
            { userId: String(user._id) },
            process.env.JWT_SECRET as string,
            { expiresIn: "30d" }
        );
        res.status(201).json({
            token,
            user: { id: String(user._id), name: user.name, email: user.email },
        });

    } catch (error) {
        res.status(500).json({ message: "Registration failed" });
    }
    
}

export async function loginUser(req: Request, res: Response) {
  try {
    
    const { email, password } = req.body;
    

    if (!email || !password) {
      res.status(400).json({ message: "Missing fields" });
    } else {
      const user = await User.findOne({ email });

      // Check if user exists and has password
      if (!user || !user.password) {
        res.status(401).json({ message: "Invalid credentials" });
      } else {
        // TypeScript safe
        const hashedPassword = user.password as string;

        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch) {
          res.status(401).json({ message: "Invalid credentials" });
        } else {
          const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET as string,
            { expiresIn: "30d" }
          );

          res.status(200).json({
            token,
            user: {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
}

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);

  } catch (err) {
    console.error("❌ getMe error:", err);
    res.status(500).json({ message: "Failed to get user" });
  }
};

export const updateUser = async (req: any, res: Response) => {
  try {
    const { location, interests } = req.body;
    
    const updateData: any = {};
    if (location) updateData.location = location;
    if (interests) updateData.interests = interests;
    if (location || interests) updateData.hasCompletedOnboarding = true;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Update user error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
};



