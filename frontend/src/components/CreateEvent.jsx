import React, { useState } from 'react';
import { createEvent } from '../api/events';

function CreateEvent({ token }) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createEvent(formData, token);
      setMessage(response.message);
    } catch (error) {
      setMessage('Event creation failed');
    }
  };

  return (
    <div>
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="eventName" placeholder="Event Name" onChange={handleChange} />
        <input type="date" name="eventDate" onChange={handleChange} />
        <button type="submit">Create Event</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default CreateEvent;
