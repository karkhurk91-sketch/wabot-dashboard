import { useEffect, useState } from 'react';

export function useWebSocketAlerts() {
  const [alert, setAlert] = useState(null);
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/alerts');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'high_score_lead') {
        setAlert(data);
        setTimeout(() => setAlert(null), 10000);
      }
    };
    return () => ws.close();
  }, []);
  return alert;
}