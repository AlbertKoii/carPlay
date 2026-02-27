"use client";
import { useState, useEffect } from 'react';

export default function LobsterPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  }, []);


  const getInternalIP = () => {
    return new Promise((resolve) => {
      // 💡 故意不給 STUN 伺服器，避免它跑去抓公網 IP
      const pc = new RTCPeerConnection({ iceServers: [] }); 
      pc.createDataChannel("");
      pc.createOffer().then(v => pc.setLocalDescription(v));
      
      const timeout = setTimeout(() => {
        pc.close();
        resolve("172.20.10.X (Manual Check Required)"); 
      }, 3500);

      pc.onicecandidate = (e) => {
        if (!e.candidate) return;
        const candidate = e.candidate.candidate;
        
        // 💡 嚴格過濾：只抓取 172.20 或 192.168 開頭的位址
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const match = candidate.match(ipRegex);
        
        if (match) {
          const ip = match[1];
          // 排除掉那個 42.79 開頭的公網 IP
          if (ip.startsWith('172.20.') || ip.startsWith('192.168.')) {
            clearTimeout(timeout);
            pc.close();

            console.log(`Detected internal IP: ${ip}`);
            resolve(ip);
          }
        }
      };
    });
  };
  

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