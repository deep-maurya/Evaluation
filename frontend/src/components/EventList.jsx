import React, { useEffect, useState } from 'react';
import { getEvents, deleteEvent } from '../api/events';

function EventList({ token }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await getEvents(token);
      setEvents(response);
    };
    fetchEvents();
  }, [token]);

  const handleDelete = async (eventId) => {
    const response = await deleteEvent(eventId, token);
    if (response.status === 1) {
      setEvents(events.filter(event => event.eventId !== eventId));
    }
  };

  return (
    <div>
      <h2>Event List</h2>
      <ul>
        {events.map(event => (
          <li key={event.eventId}>
            {event.eventName} - {event.eventDate}
            <button onClick={() => handleDelete(event.eventId)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventList;
