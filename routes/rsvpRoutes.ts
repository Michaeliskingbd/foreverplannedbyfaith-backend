import { Router } from 'express';
import { submitRsvp, getAllRsvps } from '../controllers/rsvpController';

const router = Router();

// POST /api/rsvp - Submit a new RSVP
router.post('/', submitRsvp);

// GET /api/rsvp - Get all RSVPs (Protected by passcode)
router.get('/', getAllRsvps);

export default router;
