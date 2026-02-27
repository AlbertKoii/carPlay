"use client";
import { useState, useEffect } from 'react';

export default function LobsterPage() {
  const [isRunning, setIsRunning] = useState(false);

  // 1. 預載語音引擎 (防止首次點擊沒聲音)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const startLobster = async () => {
    if (isRunning) return;
    setIsRunning(true);

    // 2. 語音：Link Start (儀式感宣告)
    const msg = new SpeechSynthesisUtterance("Link Start");
    msg.lang = "en-US";
    msg.volume = 1;
    msg.rate = 1.2; // 稍微快一點，更有科技感
    window.speechSynthesis.speak(msg);

    try {
      // 3. 探測內網 IP (WebRTC)
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel("");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      const localIP = await new Promise((resolve) => {
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const match = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          if (match) {
            pc.close();
            resolve(match[1]);
          }
        };
        // 3秒逾時保險
        setTimeout(() => resolve("172.20.10.x"), 3000); 
      });

      // 4. 回報後端 API (Next.js API Route)
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          local_ip: localIP,
          device: "Swift2006_Car_Unit"
        })
      });

      // 5. 成功後，延遲一下讓你看到動畫，然後關閉
      setTimeout(() => {
        // PWA 模式下關閉視窗的小技巧
        if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
          window.close(); // 嘗試關閉
        } else {
          // 一般瀏覽器可能不讓 script 關閉視窗，跳轉到空白頁讓它看起來關閉
          window.location.href = "about:blank";
        }
      }, 1500);

    } catch (err) {
      console.error("Report failed:", err);
      setIsRunning(false); // 失敗則允許重試
    }
  };

  return (
    <main 
      onClick={startLobster} // 點擊畫面任意處皆可啟動
      style={{ 
        background: '#000', // 全黑背景
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', // 垂直水平致中
        cursor: 'pointer',
        overflow: 'hidden' // 防止捲動
      }}
    >
      {/* 科技感龍蝦圖示 */}
      <div 
        style={{ 
          fontSize: '150px', // 大圖示
          // 科技感發光效果 (drop-shadow)
          filter: isRunning ? 'drop-shadow(0 0 30px #ff4500)' : 'drop-shadow(0 0 5px rgba(255, 69, 0, 0.3))',
          transition: 'all 0.3s ease',
          // 啟動時脈動動畫
          animation: isRunning ? 'lobster-pulse 1s infinite' : 'none'
        }}
      >
        🦞
      </div>

      {/* 啟動後的脈動動畫設定 */}
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