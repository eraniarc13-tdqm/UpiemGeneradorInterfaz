import React, { useState, useEffect } from 'react';
import LineChart from '../src/components/LineChart.tsx';
import mqtt from 'mqtt';

const Dashboard = () => {
  const [metricaGrande, setMetricaGrande] = useState('rpm');
  const [historial, setHistorial] = useState<any[]>([]);
  const [sdActivada, setSdActivada] = useState(false);

  useEffect(() => {
    const client = mqtt.connect("ws://192.168.4.1:8080", {
      clientId: "React_Savonius_" + Math.random().toString(16).substring(2, 8),
      username: "Savonius_EKL",
      password: "EKL12345",
    });

    client.on("connect", () => {
      console.log("¡Conectado al ESP32!");
      client.subscribe("savonius/sensores");
    });

    client.on("message", (_topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        
        const nuevaLectura = {
          rpm: data.rpm || 0,
          voltaje: data.voltaje || 0,
          corriente: data.corriente || 0,
          viento: data.viento || 0,
          temp: data.temp || 0,
          tiempo: new Date().toLocaleTimeString().split(' ')[0]
        };
        
        setHistorial(prev => [...prev, nuevaLectura].slice(-15));
      } catch (error) {
        console.error("Error al leer el mensaje MQTT:", error);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  const manejarSalir = () => {
    if(window.confirm("¿Estás seguro de que deseas salir y regresar al inicio?")) {
      alert("Regresando al Login...");
      window.location.reload(); 
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={manejarSalir}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd',
              background: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#555'
            }}
          >
            ← SALIR
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Optimización Savonius</h2>
            <span style={{ color: '#666', fontSize: '13px' }}>Proyecto Terminal | Monitoreo Real</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ 
            padding: '8px 15px', borderRadius: '20px', 
            background: sdActivada ? '#e8f5e9' : '#ffebee', 
            color: sdActivada ? '#2e7d32' : '#c62828',
            fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
            border: `1px solid ${sdActivada ? '#2e7d32' : '#c62828'}`
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: sdActivada ? '#4caf50' : '#f44336' }}></span>
            {sdActivada ? "SISTEMA ONLINE" : "SISTEMA OFFLINE"}
          </div>

          <button 
            onClick={() => setSdActivada(!sdActivada)}
            style={{ 
              padding: '8px 15px', borderRadius: '20px', 
              background: sdActivada ? '#2e7d32' : '#444', 
              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            {sdActivada ? "SD: GRABANDO ●" : "SD: NO DETECTADA"}
          </button>
        </div>
      </header>

      {/* GRÁFICA GRANDE */}
      <div style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, color: '#444' }}>{metricaGrande.toUpperCase()}</h3>
          <h2 style={{ margin: 0, color: '#333' }}>
            {historial.length > 0 ? historial[historial.length - 1][metricaGrande] : '0.00'}
          </h2>
        </div>
        <div style={{ height: '350px' }}>
          <LineChart 
            label={metricaGrande} 
            dataValues={historial.map(h => h[metricaGrande])} 
            labels={historial.map(h => h.tiempo)}
            color={
              metricaGrande === 'rpm' ? '#8bc34a' : 
              metricaGrande === 'voltaje' ? '#fbc02d' : 
              metricaGrande === 'corriente' ? '#fb8c00' : 
              metricaGrande === 'viento' ? '#03a9f4' : '#9c27b0'
            } 
          />
        </div>
      </div>

      {/* GRID DE LAS 5 MINIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
        <CardMini titulo="RPM" valor="rpm" historial={historial} color="#8bc34a" onClick={() => setMetricaGrande('rpm')} />
        <CardMini titulo="Voltaje (V)" valor="voltaje" historial={historial} color="#fbc02d" onClick={() => setMetricaGrande('voltaje')} />
        <CardMini titulo="Corriente (A)" valor="corriente" historial={historial} color="#fb8c00" onClick={() => setMetricaGrande('corriente')} />
        <CardMini titulo="Vel. Viento (m/s)" valor="viento" historial={historial} color="#03a9f4" onClick={() => setMetricaGrande('viento')} />
        <CardMini titulo="Temp. Ambiente (°C)" valor="temp" historial={historial} color="#9c27b0" onClick={() => setMetricaGrande('temp')} />
      </div>
    </div>
  );
};

const CardMini = ({ titulo, valor, historial, color, onClick }: any) => (
  <div onClick={onClick} style={{ 
    background: 'white', padding: '12px', borderRadius: '12px', 
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s'
  }}
  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
    <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>{titulo}</p>
    <div style={{ height: '60px' }}>
      <LineChart 
        label={valor} 
        dataValues={historial.map((h: any) => h[valor])} 
        labels={historial.map((h: any) => h.tiempo)} 
        color={color} 
      />
    </div>
    <p style={{ margin: '5px 0 0 0', textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>
        {historial.length > 0 ? historial[historial.length - 1][valor] : '0.0'}
    </p>
  </div>
);

export default Dashboard;