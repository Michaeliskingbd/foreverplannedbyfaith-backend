import { Request, Response } from 'express';
import RSVP from '../models/RSVP';

export const submitRsvp = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      willAttend,
      numberOfAttendees,
      message,
      reasonForNotAttending,
    } = req.body;

    // 1. Extract IP address
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string;

    // 2. Validate required fields
    if (!fullName || !phoneNumber || willAttend === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone number, and attendance status are required.',
      });
    }

    // 3. Prevent duplicate submissions
    // Check if IP address already exists
    const existingIp = await RSVP.findOne({ ipAddress });
    if (existingIp) {
      return res.status(409).json({
        success: false,
        message: 'An RSVP has already been submitted from your device/network.',
      });
    }

    // Check if phone number already exists
    const existingPhone = await RSVP.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'An RSVP with this phone number has already been submitted.',
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await RSVP.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'An RSVP with this email has already been submitted.',
        });
      }
    }

    // 4. Create the RSVP document
    const newRSVP = new RSVP({
      ipAddress,
      fullName,
      phoneNumber,
      email: email || undefined,
      willAttend,
      numberOfAttendees: willAttend ? numberOfAttendees || 1 : 0,
      message,
      reasonForNotAttending: !willAttend ? reasonForNotAttending : undefined,
    });

    // 4. Save to database
    await newRSVP.save();

    return res.status(201).json({
      success: true,
      message: 'RSVP submitted successfully.',
      data: newRSVP,
    });
  } catch (error: any) {
    console.error('Error submitting RSVP:', error);

    // Handle Mongoose duplicate key error (if concurrent requests slipped through)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `An RSVP with this ${duplicateField} has already been submitted.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while submitting your RSVP.',
      error: error.message,
    });
  }
};

export const getAllRsvps = async (req: Request, res: Response) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@kennyfaith2026!';
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Invalid passcode.',
      });
    }

    const rsvps = await RSVP.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: rsvps,
    });
  } catch (error: any) {
    console.error('Error fetching RSVPs:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching RSVPs.',
      error: error.message,
    });
  }
};
