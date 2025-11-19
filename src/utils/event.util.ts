import { IEvent, INormalizedEvent } from '../interfaces/event.interface.js';

export function normalizeEvent(event: IEvent): INormalizedEvent {
  const startTime = new Date(event.startTime).getTime();
  const endTime = new Date(event.endTime).getTime();
  return { ...event, startTime, endTime };
}

export function sortEvents(events: INormalizedEvent[]): INormalizedEvent[] {
  return events.sort((a, b) => a.startTime - b.startTime);
}
