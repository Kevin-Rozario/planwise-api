import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/apiError.util.js';
import type { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiReponse.util.js';
import { IEventInput } from '../validations/event.schema.js';
import { EventService } from '../services/event.service.js';

const eventService = new EventService();

/**
 * Handles the creation of a new event.
 * If the event conflicts with existing events, it returns a 409 Conflict status with suggestions.
 * Otherwise, it returns a 201 Created status with the new event's ID.
 */
export const createEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const event: IEventInput = req.body;
  if (!event) {
    return next(new ApiError(400, 'Event data is required'));
  }

  const result = await eventService.createEvent(event);

  if (result.conflicts) {
    return res.status(409).json(
      new ApiResponse(409, 'Event conflicts with existing events', {
        conflicts: result.conflicts,
        suggestion: result.suggestion,
      }),
    );
  }

  return res.status(201).json(new ApiResponse(201, 'Event created successfully', result.event!.id));
});

/**
 * Fetches all events.
 * Returns a 200 OK status with a list of all events, or a 404 Not Found status if no events are found.
 */
export const fetchEvents = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const eventsList = eventService.getEvents();

  if (eventsList.length === 0) {
    return next(new ApiError(404, 'No events found'));
  }

  return res.status(200).json(new ApiResponse(200, 'Events fetched successfully', eventsList));
});

/**
 * Fetches a single event by its ID.
 * Returns a 200 OK status with the event data, or a 404 Not Found status if the event is not found.
 */
export const fetchEventById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: eventId } = req.params;

    if (!eventId) {
      return next(new ApiError(400, 'Event ID is required'));
    }

    const event = eventService.getEventById(eventId);

    if (!event) {
      return next(new ApiError(404, 'Event not found'));
    }

    return res.status(200).json(new ApiResponse(200, 'Event fetched successfully', event));
  },
);

/**
 * Updates an existing event by its ID.
 * If the updated event conflicts with existing events, it returns a 409 Conflict status with suggestions.
 * Otherwise, it returns a 200 OK status with the updated event data.
 */
export const updateEventById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: eventId } = req.params;

    if (!eventId) {
      return next(new ApiError(400, 'Event ID is required'));
    }

    const eventData: IEventInput = req.body;

    if (!eventData) {
      return next(new ApiError(400, 'Event data is required'));
    }

    try {
      const result = await eventService.updateEventById(eventId, eventData);
      if (!result) {
        return next(new ApiError(404, 'Event not found'));
      }

      if (result.conflicts) {
        return res.status(409).json(
          new ApiResponse(409, 'Event conflicts with existing events', {
            conflicts: result.conflicts,
            suggestion: result.suggestion,
          }),
        );
      }

      return res.status(200).json(new ApiResponse(200, 'Event updated successfully', result.event));
    } catch (error: any) {
      return next(new ApiError(400, error.message));
    }
  },
);

/**
 * Deletes an event by its ID.
 * Returns a 200 OK status with the deleted event data, or a 404 Not Found status if the event is not found.
 */
export const deleteEventById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: eventId } = req.params;
    if (!eventId) {
      return next(new ApiError(400, 'Event ID is required'));
    }

    const event = eventService.deleteEventById(eventId);
    if (!event) {
      return next(new ApiError(404, 'Event not found'));
    }

    return res.status(200).json(new ApiResponse(200, 'Event deleted successfully', event));
  },
);

/**
 * Filters events by a specific tag.
 * Returns a 200 OK status with a list of events that match the tag, or a 404 Not Found status if no events are found.
 */
export const filterEventsByTag = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  const { tag } = req.query;

  if (!tag) {
    return next(new ApiError(400, 'Tag is required'));
  }

  const filteredEvents = eventService.filterEventsByTag(tag as string);

  if (filteredEvents.length === 0) {
    return next(new ApiError(404, 'No events found for the given tag'));
  }

  res.status(200).json(new ApiResponse(200, 'Events fetched successfully', filteredEvents));
});
