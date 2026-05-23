import { useEffect, useState } from 'react';
export function useWebSocketAlerts() {
  const [alert, setAlert] = useState(null);
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/alerts');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'lead_updated') setAlert(data);
      setTimeout(() => setAlert(null), 5000);
    };
    return () => ws.close();
  }, []);
  return alert;
}