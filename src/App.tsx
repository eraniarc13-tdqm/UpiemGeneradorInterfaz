import React, { useState } from 'react';
import Login from '../pages/Login.tsx';
import Dashboard from '../pages/Dashboard.tsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAccess = (status) => {
    setIsLoggedIn(status);
  };

  return (
    <div className="min-vh-100 bg-light">
      {!isLoggedIn ? (
        <Login onLogin={handleAccess} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;