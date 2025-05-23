import axios from 'axios';

export const fetchAllEvents = async () => {
  const response = await axios.get('/api/admin/events');
  return response.data;
};

export const addNoteToEvent = async (eventId, noteData) => {
  const response = await axios.post(`/api/events/${eventId}/notes`, noteData);
  return response.data;
};

export const updateEventNote = async (eventId, noteIndex, content) => {
  const response = await axios.put(`/api/events/${eventId}/notes/${noteIndex}`, { content });
  return response.data;
};

export const deleteEventNote = async (eventId, noteIndex) => {
  const response = await axios.delete(`/api/events/${eventId}/notes/${noteIndex}`);
  return response.data;
};

export const updateEventDetails = async (eventId, eventData) => {
  try {
    const response = await axios.put(`/api/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: 'Failed to update event details' };
  }
};