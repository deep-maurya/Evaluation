// src/App.js
import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import EventList from './components/EventList';
import CreateEvent from './components/CreateEvent';

function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (token) => {
    setToken(token);
  };

  return (
    <div>
      {!token ? (
        <>
          <Login onLogin={handleLogin} />
          <Register />
        </>
      ) : (
        <>
          <CreateEvent token={token} />
          <EventList token={token} />
        </>
      )}
    </div>
  );
}

export default App;
