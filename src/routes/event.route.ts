import { Router } from 'express';
import {
  createEvent,
  fetchEvents,
  fetchEventById,
  updateEventById,
  deleteEventById,
  filterEventsByTag,
} from '../controllers/event.controller.js';
import { validateMiddleware } from '../middlewares/validate.middleware.js';
import { eventSchema } from '../validations/event.schema.js';

const router = Router();

router.route('/').get(fetchEvents).post(validateMiddleware(eventSchema), createEvent);
router.route('/filtered').get(filterEventsByTag);
router
  .route('/:id')
  .get(fetchEventById)
  .put(validateMiddleware(eventSchema), updateEventById)
  .delete(deleteEventById);

export default router;
