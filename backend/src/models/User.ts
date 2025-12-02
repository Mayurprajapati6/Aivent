import mongoose, {Schema, Document} from "mongoose";

export interface IUser extends Document {
    name: string,
    email: string,
    password?: string,
    interests?: string[],
    location?: { city: string; state: string; country: string},
    freeEventsCreated: number
}

const UserSchema = new Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    interests: [String],
    location: {
        city: String,
        state: String,
        country: String,
    },
    freeEventsCreated: { type: Number, default: 0}
}, { timestamps: true});

export const User = mongoose.model<IUser>('User',UserSchema);