import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

    // 抓取真實來源 IP
    // 如果部署在 Vercel，用 'x-forwarded-for'
    // 如果是本地測試，用 'remoteAddress'
    const forwarded = request.headers.get('x-forwarded-for');
    const remoteIp = forwarded ? forwarded.split(',')[0] : request.ip || "127.0.0.1";

    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "🚗 **龍蝦號報到 (Server Verified)**",
        embeds: [{
          title: "車機連線資訊",
          color: 15105570,
          fields: [
            { name: "前端回報 IP", value: `\`${body.local_ip}\``, inline: true },
            { name: "後端偵測 IP", value: `\`${remoteIp}\``, inline: true },
            { name: "設備狀態", value: "✅ Link Start", inline: true }
          ],
          timestamp: new Date()
        }]
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}