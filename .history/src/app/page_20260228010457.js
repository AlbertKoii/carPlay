"use client";
import { useState, useEffect } from 'react';

export default function LobsterPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasMounted, setHasMounted] = useState(false); // 💡 新增：確保掛載狀態

  // 1. 確保只在客戶端渲染
  useEffect(() => {
    setHasMounted(true);
    // 預熱語音引擎
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const startLobster = async () => {
    if (isRunning || !hasMounted) return;
    setIsRunning(true);

    // 語音播放
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance("Link Start");
      msg.lang = "en-US";
      window.speechSynthesis.speak(msg);
    }

    try {
      // 直接報到，IP 留給後端抓
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          local_ip: "Client-Silent", // 前端不再探測
          device: "Swift2006_Car_Unit"
        })
      });

      // 成功後跳轉或關閉
      setTimeout(() => {
        window.location.href = "about:blank";
      }, 1500);

    } catch (err) {
      setIsRunning(false);
    }
  };

  // 💡 如果還沒掛載，先回傳一個空殼，避免伺服器渲染與客戶端不對稱
  if (!hasMounted) return <div style={{ background: '#000', height: '100vh' }} />;

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