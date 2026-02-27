import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { local_ip, device } = await request.json();
    const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
    
    // 偵測來源 IP (Vercel 或本地)
    const forwarded = request.headers.get('x-forwarded-for');
    const remoteIp = forwarded ? forwarded.split(',')[0] : request.ip || "Unknown";

    console.l

    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "🚀 **龍蝦號系統啟動完成**",
        embeds: [{
          title: "Network Diagnostics",
          color: 15105570,
          fields: [
            { name: "📍 ADB 內網 IP (最重要)", value: `\`${local_ip}\``, inline: false },
            { name: "🌐 外部來源 IP", value: `\`${remoteIp}\``, inline: false },
            { name: "📱 設備 ID", value: device, inline: true },
            { name: "🛠️ 狀態", value: "Ready for Connection", inline: true }
          ],
          footer: { text: "Protocol: WebRTC + STUN" },
          timestamp: new Date()
        }]
      })
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}