function getIPAddress() {
    return new Promise((resolve) => {
      // 💡 加入 Google 的 STUN 伺服器，強迫瀏覽器進行網路協商
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      
      pc.createDataChannel("");
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        
        // 搜尋包含 172.20.10. (iPhone 熱點) 或 192.168. (一般 WiFi) 的字串
        const candidate = ice.candidate.candidate;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const match = candidate.match(ipRegex);
        
        if (match) {
          const detectedIP = match[1];
          // 排除掉 0.0.0.0 或 127.0.0.1
          if (!detectedIP.startsWith('127.') && detectedIP !== '0.0.0.0') {
            pc.close();
            resolve(detectedIP);
          }
        }
      };

      // 5 秒保險，若沒抓到就回傳偵測失敗
      setTimeout(() => {
        pc.close();
        resolve("Detection-Failed");
      }, 5000);
    });
  }