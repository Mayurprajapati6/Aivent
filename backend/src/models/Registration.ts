import mongoose, {Schema, Document} from "mongoose";

export interface IRegistration extends Document{
    event: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    attendeeName: string;
    attendeeEmail: string;
    qrCode: string;
    checkedIn: boolean;
    checkedInAt?: Date;
    status: 'confirmed' | 'cancelled';
}

const RegistrationSchema = new Schema({
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attendeeName: String,
    attendeeEmail: String,
    qrCode: { type: String, unique: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: Date,
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

export const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema)