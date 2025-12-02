import mongoose from "mongoose";
import { serverConfig } from ".";

export async function connectDB() {
    try {
        await mongoose.connect(serverConfig.MONGODB_URI);
        console.log("Connected To MongoDB Successfully");
    } catch (error) {
        console.error("Error conneting to MongoDB", error);
        throw error;
    }
}