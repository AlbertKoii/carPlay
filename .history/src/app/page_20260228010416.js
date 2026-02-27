// ... 前面保持不變 (useEffect, hasMounted 等) ...

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

// ... 後面介面保持不變 ...