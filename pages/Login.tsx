import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === 'EKL12345') {
      onLogin(true);
    } else if (password === '') {
      alert('Por favor, ingresa la contraseña.');
    } else {
      alert('Contraseña incorrecta. Intenta de nuevo.');
      setPassword('');
    } // <--- FALTABA ESTA LLAVE PARA CERRAR EL ELSE
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px' }}>
        <div className="card-body text-center p-5">
          <h3 className="card-title mb-4" style={{ fontWeight: '300' }}>Esp32</h3>
          <p className="text-muted mb-4">Ingresa contraseña</p>
          
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              className="form-control mb-4 text-center"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ borderRadius: '10px', border: '1px solid #dee2e6' }}
            />
            
            <button 
              type="submit" 
              className="btn btn-success w-100 py-2"
              style={{ backgroundColor: '#a3ff71', border: 'none', color: '#000', fontWeight: 'bold' }}
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;