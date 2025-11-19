import { randomUUID } from 'node:crypto';
import { IEventInput } from '../validations/event.schema.js';
import { normalizeEvent, sortEvents } from '../utils/event.util.js';
import { INormalizedEvent } from '../interfaces/event.interface.js';
import { AiService } from './ai.service.js';

// In-memory store for events
const events: Map<string, INormalizedEvent> = new Map<string, INormalizedEvent>();

/**
 * The EventService class provides methods for managing events.
 * It includes methods for creating, retrieving, updating, and deleting events,
 * as well as filtering events by tag. It also integrates with the AiService
 * to provide intelligent features like conflict detection and priority generation.
 */
export class EventService {
  private aiService: AiService;

  constructor() {
    this.aiService = new AiService();
  }

  /**
   * Creates a new event.
   * If no priority is provided, it generates one using the AiService.
   * If the new event conflicts with existing events, it returns the conflicts and a suggestion for a new time.
   * @param event The event data.
   * @returns An object containing the new event, or a list of conflicts and a suggestion.
   */
  async createEvent(event: IEventInput) {
    const createdEvent = {
      ...event,
      id: randomUUID(),
    };

    if (!createdEvent.priority) {
      createdEvent.priority = await this.aiService.generatePriority(
        createdEvent.title,
        createdEvent.description,
      );
    }

    const normalizedEvent = normalizeEvent(createdEvent);
    const eventsList = Array.from(events.values());
    const conflicts = this.aiService.detectConflictsForEvent(normalizedEvent, eventsList);

    if (conflicts.length > 0) {
      const suggestion = await this.aiService.suggestBetterTime(
        normalizedEvent,
        eventsList,
        event.workingHours,
      );
      return { conflicts, suggestion };
    }

    events.set(normalizedEvent.id, normalizedEvent);
    return { event: normalizedEvent };
  }

  /**
   * Retrieves all events, sorted by start time.
   * @returns A sorted array of all events.
   */
  getEvents() {
    const eventsList = Array.from(events.values());
    return sortEvents(eventsList);
  }

  /**
   * Retrieves a single event by its ID.
   * @param eventId The ID of the event to retrieve.
   * @returns The event, or undefined if not found.
   */
  getEventById(eventId: string) {
    return events.get(eventId);
  }

  /**
   * Updates an existing event.
   * If no priority is provided, it generates one using the AiService.
   * If the updated event conflicts with existing events, it returns the conflicts and a suggestion for a new time.
   * @param eventId The ID of the event to update.
   * @param eventData The new event data.
   * @returns An object containing the updated event, or a list of conflicts and a suggestion, or null if the event is not found.
   */
  async updateEventById(eventId: string, eventData: IEventInput) {
    const existing = events.get(eventId);
    if (!existing) {
      return null;
    }

    const updatedEvent = { ...existing, ...eventData };

    if (!updatedEvent.priority) {
      updatedEvent.priority = await this.aiService.generatePriority(
        updatedEvent.title,
        updatedEvent.description,
      );
    }

    const normalizedEvent = normalizeEvent(updatedEvent);

    if (normalizedEvent.startTime >= normalizedEvent.endTime) {
      throw new Error('End time must be greater than start time');
    }

    const eventsList = Array.from(events.values());
    const conflicts = this.aiService.detectConflictsForEvent(normalizedEvent, eventsList);

    if (conflicts.length > 0) {
      const suggestion = await this.aiService.suggestBetterTime(
        normalizedEvent,
        eventsList,
        eventData.workingHours,
      );
      return { conflicts, suggestion };
    }

    events.set(normalizedEvent.id, normalizedEvent);
    return { event: normalizedEvent };
  }

  /**
   * Deletes an event by its ID.
   * @param eventId The ID of the event to delete.
   * @returns The deleted event, or null if not found.
   */
  deleteEventById(eventId: string) {
    const event = events.get(eventId);
    if (!event) {
      return null;
    }
    events.delete(eventId);
    return event;
  }

  /**
   * Filters events by a specific tag.
   * @param tag The tag to filter by.
   * @returns An array of events that include the specified tag.
   */
  filterEventsByTag(tag: string) {
    const eventList = Array.from(events.values());
    return eventList.filter((event) => event.tags.includes(tag as string));
  }
}
