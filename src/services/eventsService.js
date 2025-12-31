import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;

const flattenCalendarEvents = (payload) => {
  const data = payload?.data ?? payload;
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data !== 'object') {
    return [];
  }
  const events = [];
  Object.entries(data).forEach(([date, items]) => {
    if (!Array.isArray(items)) {
      return;
    }
    items.forEach((item) => {
      if (!item || typeof item !== 'object') {
        return;
      }
      events.push({
        ...item,
        date: item.date ?? date,
      });
    });
  });
  return events;
};

export const eventsService = {
  async createEvent(payload) {
    const response = await apiClient.post('/api/v1/events', payload);
    const data = unwrap(response);
    return data?.data ?? data;
  },
  async listEvents() {
    const response = await apiClient.get('/api/v1/events');
    const data = unwrap(response);
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },
  async listCalendar({ month } = {}) {
    const response = await apiClient.get('/api/v1/events/calendar', { params: { month } });
    return flattenCalendarEvents(unwrap(response));
  },
};
