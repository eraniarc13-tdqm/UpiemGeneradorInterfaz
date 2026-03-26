import React, { useState, useEffect, useRef } from 'react';
import LineChart from '../src/components/LineChart.tsx';

const Dashboard = () => {
  const [metricaGrande, setMetricaGrande] = useState('rpm');
  const [historial, setHistorial] = useState<any[]>([]);
  const [sdActivada, setSdActivada] = useState(false);
  
  // 1. Estado para guardar los récords (valores máximos)
  const [maximos, setMaximos] = useState({
    rpm: 0,
    voltaje: 0,
    corriente: 0,
    viento: 0,
    temp: 0
  });

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://192.168.4.1/ws");
    wsRef.current = ws;

    ws.onopen = () => console.log("¡Conectado al ESP32!");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        const nuevaLectura = {
          rpm: data.rpm || 0,
          voltaje: data.voltaje || 0,
          corriente: data.corriente || 0,
          viento: data.viento || 0,
          temp: data.temp || 0,
          tiempo: new Date().toLocaleTimeString().split(' ')[0]
        };

        // 2. Lógica para actualizar los máximos automáticamente
        setMaximos(prev => ({
          rpm: Math.max(prev.rpm, nuevaLectura.rpm),
          voltaje: Math.max(prev.voltaje, nuevaLectura.voltaje),
          corriente: Math.max(prev.corriente, nuevaLectura.corriente),
          viento: Math.max(prev.viento, nuevaLectura.viento),
          temp: Math.max(prev.temp, nuevaLectura.temp),
        }));

        setHistorial(prev => [...prev, nuevaLectura].slice(-15));
      } catch (error) {
        console.error("Error al leer los datos:", error);
      }
    };

    return () => ws.close();
  }, []);

  const manejarBotonSD = () => {
    const nuevoEstado = !sdActivada;
    setSdActivada(nuevoEstado); 

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(nuevoEstado ? "INICIAR_SD" : "DETENER_SD");
    }
  };

  const limpiarHistorial = () => {
    if(window.confirm("¿Deseas reiniciar las gráficas y los valores máximos?")) {
      setHistorial([]);
      setMaximos({ rpm: 0, voltaje: 0, corriente: 0, viento: 0, temp: 0 });
    }
  };

  const manejarSalir = () => {
    if(window.confirm("¿Estás seguro de que deseas salir?")) {
      window.location.reload(); 
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={manejarSalir} style={estiloBoton}>← SALIR</button>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Optimización Savonius</h2>
            <span style={{ color: '#666', fontSize: '13px' }}>Proyecto Terminal | Monitoreo Real</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Indicador de Estado */}
          <div style={{ 
            padding: '8px 15px', borderRadius: '20px', 
            background: sdActivada ? '#e8f5e9' : '#ffebee', 
            color: sdActivada ? '#2e7d32' : '#c62828',
            fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
            border: `1px solid ${sdActivada ? '#2e7d32' : '#c62828'}`
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: sdActivada ? '#4caf50' : '#f44336' }}></span>
            {sdActivada ? "GRABANDO DATOS" : "SISTEMA EN ESPERA"}
          </div>

          <button onClick={manejarBotonSD} style={{ ...estiloBotonSD, background: sdActivada ? '#c62828' : '#2e7d32' }}>
            {sdActivada ? "DETENER SD ■" : "INICIAR SD ●"}
          </button>
          
          <button onClick={limpiarHistorial} style={estiloBoton}>RESETEAR ⟲</button>
        </div>
      </header>

      {/* GRÁFICA GRANDE */}
      <div style={estiloCardGrande}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#444' }}>{metricaGrande.toUpperCase()}</h3>
            <span style={{fontSize: '12px', color: '#888'}}>Pico máximo: {maximos[metricaGrande as keyof typeof maximos]}</span>
          </div>
          <h2 style={{ margin: 0, color: '#333' }}>
            {historial.length > 0 ? historial[historial.length - 1][metricaGrande] : '0.00'}
          </h2>
        </div>
        <div style={{ height: '350px' }}>
          <LineChart 
            label={metricaGrande} 
            dataValues={historial.map(h => h[metricaGrande])} 
            labels={historial.map(h => h.tiempo)}
            color={obtenerColor(metricaGrande)} 
          />
        </div>
      </div>

      {/* GRID DE LAS 5 MINIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
        <CardMini titulo="RPM" valor="rpm" historial={historial} max={maximos.rpm} color="#8bc34a" onClick={() => setMetricaGrande('rpm')} />
        <CardMini titulo="Voltaje (V)" valor="voltaje" historial={historial} max={maximos.voltaje} color="#fbc02d" onClick={() => setMetricaGrande('voltaje')} />
        <CardMini titulo="Corriente (A)" valor="corriente" historial={historial} max={maximos.corriente} color="#fb8c00" onClick={() => setMetricaGrande('corriente')} />
        <CardMini titulo="Viento (m/s)" valor="viento" historial={historial} max={maximos.viento} color="#03a9f4" onClick={() => setMetricaGrande('viento')} />
        <CardMini titulo="Temp (°C)" valor="temp" historial={historial} max={maximos.temp} color="#9c27b0" onClick={() => setMetricaGrande('temp')} />
      </div>
    </div>
  );
};

// COMPONENTE MINI CARD REUTILIZABLE
const CardMini = ({ titulo, valor, historial, max, color, onClick }: any) => (
  <div onClick={onClick} style={estiloCardMini}
    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
    <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>{titulo}</p>
    <div style={{ height: '60px' }}>
      <LineChart 
        label={valor} 
        dataValues={historial.map((h: any) => h[valor])} 
        labels={historial.map((h: any) => h.tiempo)} 
        color={color} 
      />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '5px' }}>
        <span style={{fontSize: '9px', color: '#aaa'}}>MAX: {max}</span>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
            {historial.length > 0 ? historial[historial.length - 1][valor] : '0.0'}
        </p>
    </div>
  </div>
);

// FUNCIONES DE APOYO Y ESTILOS
const obtenerColor = (metrica: string) => {
    const colores: any = { rpm: '#8bc34a', voltaje: '#fbc02d', corriente: '#fb8c00', viento: '#03a9f4', temp: '#9c27b0' };
    return colores[metrica] || '#444';
};

const estiloBoton = {
    padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd',
    background: 'white', cursor: 'pointer', fontWeight: 'bold' as const, color: '#555'
};

const estiloBotonSD = {
    padding: '8px 15px', borderRadius: '20px', 
    color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' as const
};

const estiloCardGrande = {
    background: 'white', borderRadius: '15px', padding: '20px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px'
};

const estiloCardMini = {
    background: 'white', padding: '12px', borderRadius: '12px', 
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s'
};

export default Dashboard;