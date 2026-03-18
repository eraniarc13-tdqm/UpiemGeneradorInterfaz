import React, { useState } from 'react';
import Login from '/Users/eraniarciniefa/Desktop/TT/Interfaz/interfaz/pages/Login.tsx';
import Dashboard from '/Users/eraniarciniefa/Desktop/TT/Interfaz/interfaz/pages/Dashboard.tsx';

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