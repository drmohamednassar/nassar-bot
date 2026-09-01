import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";

export default async function (sock, m, from, args, config) {
  const senderJid = m.key.participant || m.key.remoteJid || "";
  const senderNumber = senderJid.split("@")[0].replace(/[^0-9]/g, "");

  // التحقق من صلاحيات المطور (sudo)
  const isSudo = Array.isArray(config.sudo) 
    ? config.sudo.some(num => String(num).replace(/[^0-9]/g, "") === senderNumber)
    : String(config.sudo || "").replace(/[^0-9]/g, "") === senderNumber;

  if (!isSudo) {
    return sock.sendMessage(from, { 
      text: "⛔ *عذراً، هذه اللوحة مخصصة للمطورين وحسابات VIP المصرح لها فقط!*" 
    }, { quoted: m });
  }

  const startTime = Date.now();
  const latency = ((Date.now() - startTime) / 1000).toFixed(4);

  const vipCard = `
╭━━━〔 👑 *VIP CONTROL PANEL* 〕━━━╮
┃ 👤 *المطور المعتمد:* +${senderNumber}
┃ 🛡️ *مستوى الصلاحية:* Root / Owner
┃ ⚡ *الاستجابة:* ${latency}ms
╰━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();

  const vipHeaderImage = "https://i.postimg.cc/XYtWtSYw/1299888.png";

  try {
    const media = await prepareWAMessageMedia(
      { image: { url: vipHeaderImage } }, 
      { upload: sock.waUploadToServer }
    );

    const interactiveMessage = {
      header: {
        title: `👑 VIP Access Granted\n`,
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      body: {
        text: vipCard
      },
      footer: {
        text: `🛡️ لوحة التحكم السريعة - ${config.botName || "BOT"}`
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "⚡ أوامر السيطرة والإدارة",
              sections: [
                {
                  title: "👑 أوامر التحكم في البوت والجروبات",
                  rows: [
                    { id: `${config.prefix}bc`, title: "📢 إذاعة عامة", description: "إرسال رسالة لكل الجروبات المشترك بها البوت" },
                    { id: `${config.prefix}join`, title: "🚪 دخول مجموعة", description: "انضمام البوت لأي جروب فوراً عبر الرابط" },
                    { id: `${config.prefix}leave`, title: "👋 مغادرة المجموعة", description: "خروج البوت من الجروب الحالي فوراً" }
                  ]
                },
                {
                  title: "🛡️ الإدارة السريعة والحماية",
                  rows: [
                    { id: `${config.prefix}group close`, title: "🔒 قفل الجروب فوراً", description: "منع الأعضاء من الكتابة داخل الشات" },
                    { id: `${config.prefix}group open`, title: "🔓 فتح الجروب فوراً", description: "السماح لجميع الأعضاء بالكتابة" },
                    { id: `${config.prefix}del`, title: "🗑️ حذف رسالة", description: "حذف أي رسالة مزعجة بالرد عليها" },
                    { id: `${config.prefix}ping`, title: "⚡ فحص سرعة السيرفر", description: "فحص استقرار الخادم وسرعة الرد" },
                    { id: `${config.prefix}profile`, title: "👤 كشف حساب", description: "جلب معلومات وبروفايل أي شخص بالمنشن/الرد" },
                    { id: `${config.prefix}vv`, title: "🔓 فك وسائط لمرة واحدة", description: "استخراج الصور والفيديوهات المحمية" }
                  ]
                }
              ]
            })
          }
        ]
      }
    };

    const msg = generateWAMessageFromContent(
      from,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage
          }
        }
      },
      { quoted: m }
    );

    await sock.relayMessage(from, msg.message, { messageId: msg.key.id });

  } catch (err) {
    const fallbackText = `
${vipCard}

👑 *أوامر المطور المتاحة:*
* ${config.prefix}bc [نص الرسالة]
* ${config.prefix}join [رابط الجروب]
* ${config.prefix}leave
* ${config.prefix}group [open / close]
* ${config.prefix}del (بالرد على الرسالة)
* ${config.prefix}vv (بالرد على ميديا العرض لمرة واحدة)
* ${config.prefix}ping
`.trim();

    await sock.sendMessage(
      from,
      {
        image: { url: vipHeaderImage },
        caption: fallbackText
      },
      { quoted: m }
    );
  }
}
