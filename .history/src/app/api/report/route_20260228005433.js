import { NextResponse } from 'next/server';

export async function POST(request) {
  const { local_ip, device } = await request.json();
  const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

  console.log(`Received report: local_ip=${local_ip}, device=${device}`);

  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "🚗 **龍蝦號 PWA 報到！**",
        embeds: [{
          title: "車機連線資訊",
          color: 15105570,
          fields: [
            { name: "內網 IP (ADB)", value: `\`${local_ip}\``, inline: true },
            { name: "設備狀態", value: "Link Start Success", inline: true }
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