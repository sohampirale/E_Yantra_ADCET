import mongoose, { Document, Schema } from 'mongoose';

// User Model
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  image?: string;
  password?: string;
  role: 'student' | 'mentor';
  totalPoints: number;
  sessionsJoined: string[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  password: { type: String },
  role: { type: String, enum: ['student', 'mentor'], default: 'student' },
  totalPoints: { type: Number, default: 0 },
  sessionsJoined: [{ type: Schema.Types.ObjectId, ref: 'Session' }],
  createdAt: { type: Date, default: Date.now },
});

// Session Model
export interface ISession extends Document {
  _id: string;
  title: string;
  description?: string;
  date: Date;
  createdBy: string;
  participants: string[];
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

// Participation Model
export interface IParticipation extends Document {
  _id: string;
  sessionId: string;
  userId: string;
  pointsAwarded: number;
  awardedBy: string;
  awardedAt: Date;
}

const ParticipationSchema = new Schema<IParticipation>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pointsAwarded: { type: Number, default: 0 },
  awardedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  awardedAt: { type: Date, default: Date.now },
});

// Feedback Model
export interface IFeedback extends Document {
  _id: string;
  sessionId: string;
  content: string;
  anonymous: boolean;
  userId?: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  content: { type: String, required: true },
  anonymous: { type: Boolean, default: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

// Export models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
export const Participation = mongoose.models.Participation || mongoose.model<IParticipation>('Participation', ParticipationSchema);
export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);