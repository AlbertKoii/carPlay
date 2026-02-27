"use client";
import { useState, useEffect } from 'react';

export default function LobsterPage() {
  const [status, setStatus] = useState("SYSTEM READY");
  const [isRunning, setIsRunning] = useState(false);
  const [localIP, setLocalIP] = useState("---.---.---.---");

  // 預載語音引擎，防止首次點擊沒聲音
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const startLobster = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStatus("LINK STARTING...");

    // 1. 語音宣告 (儀式感核心)
    const msg = new SpeechSynthesisUtterance("Link Start");
    msg.lang = "en-US";
    msg.volume = 1;
    msg.rate = 1.1;
    msg.pitch = 1.0;
    window.speechSynthesis.speak(msg);

    try {
      // 2. 探測內網 IP (WebRTC)
      setStatus("SCANNING NETWORK...");
      const ip = await getIPAddress();
      setLocalIP(ip);

      // 3. 回報後端 API (Next.js API Route)
      setStatus("REPORTING TO DISCORD...");
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          local_ip: ip,
          device: "Swift2006_Car_Unit"
        })
      });

      if (response.ok) {
        setStatus("CONNECTION ESTABLISHED!");
      } else {
        throw new Error("Discord Report Failed");
      }

      // 4. 倒數後自動關閉或跳轉
      setTimeout(() => {
        // 嘗試關閉視窗，或跳轉至 Google Maps 導航
        window.location.href = "google.navigation:q=home"; 
      }, 2500);

    } catch (err) {
      console.error(err);
      setStatus("ERROR: " + err.message);
      setIsRunning(false);
    }
  };

  // WebRTC 偵測內網 IP 的輔助函式
  function getIPAddress() {
    return new Promise((resolve) => {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel("");
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        const match = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (match) {
          pc.close();
          resolve(match[1]);
        }
      };
      // 如果 5 秒抓不到 (通常是防火牆擋住)，回傳預設熱點段
      setTimeout(() => resolve("172.20.10.x (Timeout)"), 5000);
    });
  }

  return (
    <main style={{ 
      background: '#000', 
      color: '#ff4500', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'monospace',
      textAlign: 'center'
    }}>
      {/* 龍蝦 LOGO 與 動畫 */}
      <div 
        onClick={startLobster}
        style={{ 
          fontSize: '120px', 
          cursor: 'pointer',
          filter: isRunning ? 'drop-shadow(0 0 20px #ff4500)' : 'none',
          transition: 'all 0.5s ease',
          animation: isRunning ? 'pulse 1s infinite' : 'none'
        }}
      >
        🦞
      </div>

      <h2 style={{ letterSpacing: '8px', margin: '20px 0' }}>PROJECT LOBSTER</h2>
      
      <div style={{ 
        border: '1px solid #ff4500', 
        padding: '20px', 
        width: '300px',
        background: 'rgba(255, 69, 0, 0.1)' 
      }}>
        <p style={{ color: '#aaa', fontSize: '12px', margin: '0' }}>TARGET IP</p>
        <p style={{ fontSize: '20px', margin: '5px 0' }}>{localIP}</p>
        <hr style={{ borderColor: '#ff4500', opacity: 0.3 }} />
        <p style={{ fontSize: '14px', color: isRunning ? '#00ff00' : '#ff4500' }}>{status}</p>
      </div>

      {!isRunning && (
        <button 
          onClick={startLobster}
          style={{
            marginTop: '30px',
            padding: '12px 40px',
            background: 'transparent',
            color: '#ff4500',
            border: '2px solid #ff4500',
            fontSize: '18px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: '0.3s'
          }}
          onMouseOver={(e) => { e.target.style.background = '#ff4500'; e.target.style.color = '#000'; }}
          onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff4500'; }}
        >
          INITIALIZE LINK
        </button>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        body { margin: 0; padding: 0; overflow: hidden; }
      `}</style>
    </main>
  );
}