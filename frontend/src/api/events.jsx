
import axios from 'axios';

const API_URL = 'https://evaluation-1-1q6d.onrender.com';

export const createEvent = async (eventData, token) => {
  const response = await axios.post(`${API_URL}/create`, eventData, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getEvents = async (token) => {
  const response = await axios.get(`${API_URL}/events`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteEvent = async (eventId, token) => {
  const response = await axios.post(`${API_URL}/delete`, { eventId }, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
