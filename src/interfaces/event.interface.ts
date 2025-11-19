import { IEventInput } from '../validations/event.schema.js';

export interface IEvent extends IEventInput {
  id: string;
}

export interface INormalizedEvent {
  id: string;
  title: string;
  description: string;
  mode: 'online' | 'offline';
  venue: string;
  startTime: number;
  endTime: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}
