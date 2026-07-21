import mongoose, { Document, Schema } from 'mongoose';

export interface IRSVP extends Document {
  fullName: string;
  phoneNumber: string;
  email?: string;
  willAttend: boolean;
  numberOfAttendees: number;
  message?: string;
  reasonForNotAttending?: string;
  ipAddress: string;
}

const rsvpSchema: Schema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: [true, 'IP address is required for rate limiting'],
      unique: true, // Enforce one RSVP per IP address.
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // This allows null/empty emails but enforces uniqueness if an email is provided
    },
    willAttend: {
      type: Boolean, // true for "Yes", false for "No"
      required: [true, 'Attendance status is required'],
    },
    numberOfAttendees: {
      type: Number,
      default: 0,
      required: function (this: IRSVP) {
        return this.willAttend === true;
      },
      min: [0, 'Cannot have less than 0 attendees'],
    },
    message: {
      type: String,
      trim: true,
    },
    reasonForNotAttending: {
      type: String,
      trim: true,
      // This field is optional, usually collected if willAttend is false
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const RSVP = mongoose.model<IRSVP>('RSVP', rsvpSchema);

export default RSVP;
