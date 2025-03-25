import axios from 'axios';

// API base URL (Update with your backend API URL)
const API_URL = 'http://Localhost:4000/api/calendar'; // Adjust this to your backend URL

// Fetch all events
export const fetchEvents = async () => {
    try {
        const response = await axios.get(`${API_URL}/events`);
        return response.data;
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

// Add a new event
export const addEvent = async (eventData) => {
    try {
        const response = await axios.post(`${API_URL}/add`, eventData);
        return response.data;
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
};

// Delete an event by ID
export const deleteEvent = async (eventId) => {
    try {
        const response = await axios.delete(`${API_URL}/delete/${eventId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
    }
};
