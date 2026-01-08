const API_BASE = 'https://functions.poehali.dev';

export const API_ENDPOINTS = {
  auth: `${API_BASE}/5fe7a9ba-62f6-411f-a1c5-f6d82c93c35a`,
  events: `${API_BASE}/f27bd71c-c4ea-4920-af70-53f3bd15e7b4`,
  push: `${API_BASE}/0be81e1e-f5bf-4954-a00b-b1949d53a450`
};

export interface User {
  id: number;
  telegram_id: number;
  username: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  rating: number;
  events_created: number;
  helpful_reports: number;
}

export interface RoadEvent {
  id: number;
  type: 'accident' | 'ice' | 'snow' | 'repair' | 'other';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  distance: number;
  helpful_count: number;
  timestamp: string;
  author: {
    name: string;
    avatar: string;
    rating: number;
  };
}

export async function authenticateTelegram(telegramData: any): Promise<User> {
  const response = await fetch(API_ENDPOINTS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegramData })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.user;
}

export async function getEvents(lat: number, lng: number, radius: number = 59): Promise<RoadEvent[]> {
  const response = await fetch(`${API_ENDPOINTS.events}?lat=${lat}&lng=${lng}&radius=${radius}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.events;
}

export async function createEvent(
  userId: number,
  type: string,
  title: string,
  description: string,
  latitude: number,
  longitude: number
): Promise<number> {
  const response = await fetch(API_ENDPOINTS.events, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, type, title, description, latitude, longitude })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.event_id;
}

export async function voteEvent(eventId: number, userId: number): Promise<void> {
  const response = await fetch(API_ENDPOINTS.events, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: eventId, user_id: userId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
}

export async function subscribePush(userId: number, subscription: PushSubscription): Promise<void> {
  const response = await fetch(API_ENDPOINTS.push, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'subscribe',
      user_id: userId,
      subscription: subscription.toJSON()
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
}
