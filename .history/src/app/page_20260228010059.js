"use client";
import { useState, useEffect } from 'react';

export default function LobsterPage() {
  const [isRunning, setIsRunning] = useState(false);

  // 1. 強制預熱語音引擎
  useEffect(() => {
    const preloadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    };
    preloadVoices();
    // 某些瀏覽器需要監聽 voiceschanged 事件
    window.speechSynthesis.onvoiceschanged = preloadVoices;
  }, []);

  const startLobster = async () => {
    if (isRunning) return;
    setIsRunning(true);

    // 2. 語音補丁：先取消所有排隊中的語音，再重新播放
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // 先清空喉嚨
      const msg = new SpeechSynthesisUtterance("Link Start");
      msg.lang = "en-US";
      msg.volume = 1;
      msg.rate = 1.2;
      window.speechSynthesis.speak(msg);
    }

    try {
      // 3. 探測內網 IP (WebRTC)
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel("");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      const localIP = await new Promise((resolve) => {
        pc.onicecandidate = (ice) => {
          if (!ice?.candidate?.candidate) return;
          const match = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          if (match) {
            pc.close();
            resolve(match[1]);
          }
        };
        setTimeout(() => resolve("172.20.10.x"), 3000); 
      });

      // 4. 回報 Discord
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          local_ip: localIP,
          device: "Swift2006_Car_Unit"
        })
      });

      // 5. 成功後自動關閉
      setTimeout(() => {
        if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
          window.close();
        } else {
          window.location.href = "about:blank";
        }
      }, 1500);

    } catch (err) {
      console.error("Report failed:", err);
      setIsRunning(false);
    }
  };

  return (
    <main 
      onClick={startLobster}
      style={{ 
        background: '#000',
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{ 
          fontSize: '150px',
          filter: isRunning ? 'drop-shadow(0 0 30px #ff4500)' : 'drop-shadow(0 0 5px rgba(255, 69, 0, 0.3))',
          transition: 'all 0.3s ease',
          animation: isRunning ? 'lobster-pulse 1s infinite' : 'none'
        }}
      >
        🦞
      </div>

      <style jsx global>{`
        @keyframes lobster-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        body { margin: 0; padding: 0; background: #000; }
      `}</style>
    </main>
  );
}