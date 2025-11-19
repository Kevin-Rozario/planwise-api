import type { GenerativeModel } from '@google/generative-ai';
import { INormalizedEvent } from '../interfaces/event.interface.js';
import { genAI } from './gemini.service.js';

interface IWorkingHours {
  start: string;
  end: string;
}

/**
 * The AiService class provides methods for interacting with the Gemini AI model.
 * It includes methods for detecting event conflicts, suggesting better times,
 * generating event priorities, auto-rescheduling events, improving event descriptions,
 * generating summaries, and processing natural language queries.
 */
export class AiService {
  private model: GenerativeModel;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Detects conflicts between a new event and a list of existing events.
   * @param event The new event to check for conflicts.
   * @param events The list of existing events.
   * @returns An array of events that conflict with the new event.
   */
  detectConflictsForEvent(event: INormalizedEvent, events: INormalizedEvent[]): INormalizedEvent[] {
    const conflicts: INormalizedEvent[] = [];
    for (const existingEvent of events) {
      if (existingEvent.id === event.id) {
        continue;
      }
      if (event.startTime < existingEvent.endTime && event.endTime > existingEvent.startTime) {
        conflicts.push(existingEvent);
      }
    }
    return conflicts;
  }

  /**
   * Suggests a better time for a conflicting event using the Gemini AI model.
   * @param conflictingEvent The event that has a conflict.
   * @param allEvents The list of all existing events.
   * @param workingHours The user's working hours.
   * @returns A suggested new start time for the event, or null if no suggestion can be made.
   */
  async suggestBetterTime(
    conflictingEvent: INormalizedEvent,
    allEvents: INormalizedEvent[],
    workingHours?: IWorkingHours,
  ) {
    console.log('AI: Suggesting better time for event:', conflictingEvent.title);
    const prompt = `
      You are an intelligent event scheduler. Your task is to suggest a new time slot for a conflicting event.
      The user wants to schedule the following event:
      - Title: ${conflictingEvent.title}
      - Duration: ${(conflictingEvent.endTime - conflictingEvent.startTime) / (1000 * 60)} minutes

      However, this event conflicts with one or more existing events. Here is the list of all scheduled events:
      ${allEvents.map(
        (e) =>
          `- ${e.title} from ${new Date(e.startTime).toLocaleTimeString()} to ${new Date(
            e.endTime,
          ).toLocaleTimeString()}`,
      )}

      Please suggest a new start time for the conflicting event. The user's working hours are from ${
        workingHours?.start || '9:00'
      } to ${workingHours?.end || '18:00'}.
      Provide the suggestion in the following JSON format: { "startTime": "YYYY-MM-DDTHH:mm:ss.SSSZ" }
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        const suggestion = JSON.parse(jsonMatch[1]);
        console.log('AI: Suggested time:', suggestion);
        return suggestion;
      } else {
        console.error('AI: No JSON found in Gemini response for suggestBetterTime:', text);
        return null;
      }
    } catch (error) {
      console.error('AI: Error parsing Gemini response for suggestBetterTime:', error);
      return null;
    }
  }

  /**
   * Generates a priority for an event based on its title and description.
   * @param title The title of the event.
   * @param description The description of the event.
   * @returns A priority level ('low', 'medium', or 'high').
   */
  async generatePriority(title: string, description: string): Promise<'low' | 'medium' | 'high'> {
    console.log('AI: Generating priority for event:', title);
    const prompt = `
      You are an AI assistant that helps categorize event priorities.
      Based on the following event title and description, determine if the priority should be 'low', 'medium', or 'high'.
      Title: ${title}
      Description: ${description}
      
      Provide your answer as a single word: low, medium, or high.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().toLowerCase().trim();

    if (text === 'low' || text === 'medium' || text === 'high') {
      console.log('AI: Generated priority:', text);
      return text as 'low' | 'medium' | 'high';
    } else {
      console.warn('AI: Gemini returned an unexpected priority:', text);
      return 'medium'; // Default to medium if AI response is unclear
    }
  }

  /**
   * Automatically reschedules a conflicting event by suggesting a new time.
   * @param conflictingEvent The event to reschedule.
   * @param allEvents The list of all existing events.
   * @param workingHours The user's working hours.
   * @returns A suggested new start time for the event, or null if no suggestion can be made.
   */
  async autoRescheduleEvent(
    conflictingEvent: INormalizedEvent,
    allEvents: INormalizedEvent[],
    workingHours?: IWorkingHours,
  ): Promise<{ startTime: string } | null> {
    console.log('AI: Auto-rescheduling event:', conflictingEvent.title);
    const prompt = `
      You are an intelligent event scheduler. Your task is to find an alternative time slot for an event that conflicts with existing events.
      The event to reschedule is:
      - Title: ${conflictingEvent.title}
      - Current Start Time: ${new Date(conflictingEvent.startTime).toLocaleTimeString()}
      - Current End Time: ${new Date(conflictingEvent.endTime).toLocaleTimeString()}
      - Duration: ${(conflictingEvent.endTime - conflictingEvent.startTime) / (1000 * 60)} minutes

      Here is the list of all scheduled events:
      ${allEvents.map(
        (e) =>
          `- ${e.title} from ${new Date(e.startTime).toLocaleTimeString()} to ${new Date(
            e.endTime,
          ).toLocaleTimeString()}`,
      )}

      Please suggest a new start time for the conflicting event that does not overlap with any other event.
      The user's working hours are from ${workingHours?.start || '9:00'} to ${
      workingHours?.end || '18:00'
    }.
      Provide the suggestion in the following JSON format: { "startTime": "YYYY-MM-DDTHH:mm:ss.SSSZ" }
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        const suggestion = JSON.parse(jsonMatch[1]);
        console.log('AI: Auto-reschedule suggestion:', suggestion);
        return suggestion;
      } else {
        console.error('AI: No JSON found in Gemini response for autoRescheduleEvent:', text);
        return null;
      }
    } catch (error) {
      console.error('AI: Error parsing Gemini response for autoRescheduleEvent:', error);
      return null;
    }
  }

  /**
   * Improves an event's description using the Gemini AI model.
   * @param currentDescription The current description of the event.
   * @returns An improved description, or null if no improvement can be made.
   */
  async improveDescription(currentDescription: string): Promise<string | null> {
    console.log('AI: Improving description:', currentDescription);
    const prompt = `
      You are an AI assistant that helps improve event descriptions.
      Please enhance the following event description to be concise, engaging, to the point and clear.
      Current Description: ${currentDescription}
      
      Provide only the improved description.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log('AI: Improved description:', text);
    return text;
  }

  /**
   * Generates a summary of a list of events.
   * @param eventsToSummarize The list of events to summarize.
   * @returns A summary of the events, or null if no summary can be generated.
   */
  async generateSummary(eventsToSummarize: INormalizedEvent[]): Promise<string | null> {
    console.log('AI: Generating summary for events:', eventsToSummarize.length);
    const eventsList = eventsToSummarize
      .map(
        (e) =>
          `- ${e.title} (${new Date(e.startTime).toLocaleDateString()} ${new Date(
            e.startTime,
          ).toLocaleTimeString()} - ${new Date(e.endTime).toLocaleTimeString()})`,
      )
      .join('\n');

    const prompt = `
      You are an AI assistant that summarizes event schedules.
      Please provide a concise summary of the following events:
      ${eventsList}
      
      Provide only the summary.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log('AI: Generated summary:', text);
    return text;
  }

  /**
   * Answers a natural language query about a user's schedule.
   * @param query The natural language query.
   * @param events The list of all existing events.
   * @returns An answer to the query, or null if no answer can be generated.
   */
  async naturalLanguageQuery(query: string, events: INormalizedEvent[]): Promise<string | null> {
    console.log('AI: Processing natural language query:', query);
    const eventsList = events
      .map(
        (e) =>
          `- ${e.title} (${new Date(e.startTime).toLocaleDateString()} ${new Date(
            e.startTime,
          ).toLocaleTimeString()} - ${new Date(e.endTime).toLocaleTimeString()})`,
      )
      .join('\n');

    const prompt = `
      You are an AI assistant that can answer questions about a user's schedule.
      Here is the user's schedule:
      ${eventsList}

      Here is the user's question: "${query}"

      Please answer the user's question based on the provided schedule.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log('AI: Natural language query answer:', text);
    return text;
  }
}
