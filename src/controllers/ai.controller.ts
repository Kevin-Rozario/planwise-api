import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/apiError.util.js';
import type { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiReponse.util.js';
import { AiService } from '../services/ai.service.js';
import { EventService } from '../services/event.service.js';

const aiService = new AiService();
const eventService = new EventService();

/**
 * Handles the auto-rescheduling of a conflicting event.
 * It fetches the event by its ID and uses the AiService to find a new time slot.
 * Returns a 200 OK status with the suggestion, or an error if the event is not found or a new time cannot be suggested.
 */
export const autoReschedule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: eventId } = req.params;

    if (!eventId) {
      return next(new ApiError(400, 'Event ID is required'));
    }

    const eventToReschedule = eventService.getEventById(eventId);

    if (!eventToReschedule) {
      return next(new ApiError(404, 'Event not found'));
    }

    const allEvents = eventService.getEvents();
    const suggestion = await aiService.autoRescheduleEvent(eventToReschedule, allEvents);

    if (!suggestion) {
      return next(new ApiError(500, 'Could not suggest a new time for rescheduling'));
    }

    return res.status(200).json(new ApiResponse(200, 'Auto reschedule suggestion', suggestion));
  },
);

/**
 * Improves the description of an event using the AiService.
 * It fetches the event by its ID and returns a 200 OK status with the improved description.
 * If the event is not found or the description cannot be improved, it returns an error.
 */
export const improveDescription = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: eventId } = req.params;

    if (!eventId) {
      return next(new ApiError(400, 'Event ID is required'));
    }

    const event = eventService.getEventById(eventId);

    if (!event) {
      return next(new ApiError(404, 'Event not found'));
    }

    const improvedDescription = await aiService.improveDescription(event.description);

    if (!improvedDescription) {
      return next(new ApiError(500, 'Could not improve description'));
    }

    return res.status(200).json(
      new ApiResponse(200, 'Description improved successfully', {
        description: improvedDescription,
      }),
    );
  },
);

/**
 * Generates a summary of all events using the AiService.
 * It returns a 200 OK status with the summary, or an error if no events are found or a summary cannot be generated.
 */
export const generateSummary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const allEvents = eventService.getEvents();

    if (allEvents.length === 0) {
      return next(new ApiError(404, 'No events found to summarize'));
    }

    const summary = await aiService.generateSummary(allEvents);

    if (!summary) {
      return next(new ApiError(500, 'Could not generate summary'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'Events summary generated successfully', { summary }));
  },
);

/**
 * Processes a natural language query about the user's schedule using the AiService.
 * It returns a 200 OK status with the answer, or an error if the query cannot be processed.
 */
export const naturalLanguageQuery = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.body;

    if (!query) {
      return next(new ApiError(400, 'Query is required'));
    }

    const allEvents = eventService.getEvents();
    const answer = await aiService.naturalLanguageQuery(query, allEvents);

    if (!answer) {
      return next(new ApiError(500, 'Could not process natural language query'));
    }

    return res.status(200).json(new ApiResponse(200, 'Query processed successfully', { answer }));
  },
);
