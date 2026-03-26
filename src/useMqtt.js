import { useState, useEffect, useCallback } from 'react';
import mqtt from 'mqtt';

const useMqtt = (host, options) => {
  const [client, setClient] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const mqttClient = mqtt.connect(host, options);

    mqttClient.on('connect', () => {
      setIsJoined(true);
      console.log('Conectado al ESP32 Broker');
    });

    mqttClient.on('error', (err) => {
      console.error('Error de conexión:', err);
      mqttClient.end();
    });

    mqttClient.on('message', (topic, message) => {
      const payload = message.toString();
      setMessages((prevMessages) => ({
        ...prevMessages,
        [topic]: payload,
      }));
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [host, options]);

  const subscribe = useCallback((topic) => {
    if (client) {
      client.subscribe(topic, (err) => {
        if (!err) {
          console.log(`Suscrito a: ${topic}`);
        }
      });
    }
  }, [client]);

  const publish = useCallback((topic, message) => {
    if (client) {
      client.publish(topic, message);
    }
  }, [client]);

  return { isJoined, messages, subscribe, publish };
};

export default useMqtt;