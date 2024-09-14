import { events } from '@/data/events';
import { Status, Event, EventLocation } from "@/lib/events/types";
import { MegaphoneIcon } from '@heroicons/react/16/solid';

export function getStatus(event: Event) {
  const now = new Date();
  if (now < event.start) {
    return Status.Upcoming;
  }
  if (now > event.end) {
    return Status.Past;
  }
  return Status.Current;
}

export function isAcceptingRegistrations(event: Event) {
  return getStatus(event) === Status.Upcoming;
}

export function formatDescription(description: string) {
  return description.replace(/\n/g, '<br>');
}

export function formatLocation(location: EventLocation) {
  return `${location.name}, ${location.streetAddress}, ${location.postalCode} ${location.city}`
}

export function getAllEvents() {
  return events;
}

export function getEvent(slug: string) {
  return events.find(event => event.slug === slug);
}