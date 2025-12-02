import mongoose, {Schema, Document} from "mongoose";

export interface IEvent extends Document {
    title: string;
    description: string;
    slug: string;
    organizer: mongoose.Types.ObjectId;
    category: string;
    startDate: Date;
    endDate: Date;
    locationType: 'physical' | 'online';
    city: string;
    state?: string;
    venue?: string;
    capacity: number;
    ticketType: 'free' | 'paid';
    ticketPrice?: number;
    coverImage?: string;
    themeColor?: string;
    registrationCount: number;
}

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, unique: true },
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    locationType: { type: String, enum: ['physical', 'online'], default: 'physical' },
    city: { type: String, required: true },
    state: String,
    venue: String,
    capacity: { type: Number, required: true },
    ticketType: { type: String, enum: ['free', 'paid'], default: 'free' },
    ticketPrice: Number,
    coverImage: String,
    themeColor: { type: String, default: '#1e3a8a' },
    registrationCount: { type: Number, default: 0 }
}, { timestamps: true });

EventSchema.index({ title: 'text', description: 'text', city: 'text'});

export const Event = mongoose.model<IEvent>('Event',EventSchema);