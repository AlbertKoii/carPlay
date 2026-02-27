"use client";
import { useState, useEffect } from 'react';

export default function LobsterPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  }, []);



  

  const startLobster = async () => {
    if (isRunning || !hasMounted) return;
    setIsRunning(true);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance("Link Start");
      msg.lang = "en-US";
      window.speechSynthesis.speak(msg);
    }

    const ip = await getInternalIP();

    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local_ip: ip, device: "Swift2006_Car_Unit" })
    });

    //   setTimeout(() => {
    //     window.location.href = "about:blank";
    //   }, 1500);
  };

  if (!hasMounted) return <div style={{ background: '#000', height: '100vh' }} />;

  return (
    <main onClick={startLobster} style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyCenter: 'center', cursor: 'pointer', overflow: 'hidden' }}>
      <div style={{ fontSize: '150px', filter: isRunning ? 'drop-shadow(0 0 30px #ff4500)' : 'drop-shadow(0 0 5px rgba(255, 69, 0, 0.3))', animation: isRunning ? 'pulse 1s infinite' : 'none' }}>🦞</div>
      <style jsx global>{`
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        body { margin: 0; display: flex; align-items: center; justify-content: center; background: #000; }
      `}</style>
    </main>
  );
}