"use client";
import { useEffect, useState } from 'react';

export default function LobsterPage() {
  const [status, setStatus] = useState("INITIALIZING...");

  useEffect(() => {
    const startLobster = async () => {
      // 1. 語音：Link Start
      const msg = new SpeechSynthesisUtterance("Link Start");
      msg.lang = "en-US";
      window.speechSynthesis.speak(msg);

      // 2. 偵測內網 IP (WebRTC)
      setStatus("SCANNING IP...");
      const pc = new RTCPeerConnection();
      pc.createDataChannel("");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      const localIP = offer.sdp.split('\n')
        .find(line => line.includes('candidate'))
        ?.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/)?.[1] || "172.20.10.x";

        console.log("Detected Local IP:", localIP);

      // 3. 回報後端
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ local_ip: localIP, device: "Swift2006" })
      });

      setStatus("LINK ESTABLISHED");

      // 4. 關閉或跳轉
      setTimeout(() => {
        window.location.href = "google.navigation:q=home"; // 嘗試開啟導航或關閉
      }, 2000);
    };

    startLobster();
  }, []);

  return (
    <main style={{ background: '#000', color: '#ff4500', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center' }}>
      <h1 style={{ fontSize: '100px' }}>🦞</h1>
      <p style={{ letterSpacing: '5px', fontWeight: 'bold' }}>{status}</p>
    </main>
  );
}