import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";

export default async function (sock, m, from, args, config) {
  const senderNumber = (m.key.participant || m.key.remoteJid).split("@")[0];

  if (!config.sudo.includes(senderNumber)) {
    return sock.sendMessage(from, { 
      text: "⛔ *عذراً، هذه القائمة مخصصة للأعضاء المميزين (VIP) والمطورين فقط!*" 
    }, { quoted: m });
  }

  const startTime = Date.now();
  const latency = ((Date.now() - startTime) / 1000).toFixed(4);

  const vipCard = `
╭━━━〔 👑 *VIP CONTROL PANEL* 〕━━━╮
┃ 👤 *المطور المعتمد:* +${senderNumber}
┃ 🛡️ *مستوى الصلاحية:* Root / Owner (كامل الصلاحيات)
┃ ⚡ *الاستجابة:* ${latency}ms
╰━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();

  const vipHeaderImage = "https://images.wallpapersden.com/image/download/kurumi-tokisaki-date-a-live-anime-girl_bW1sZ2aUmZqaraWkpJRmZ21lrWxnZQ.jpg";

  try {
    const media = await prepareWAMessageMedia({ image: { url: vipHeaderImage } }, { upload: sock.waUploadToServer });

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
        text: `🛡️ لوحة التحكم السريعة - ${config.botName}`
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "⚡ أوامر التحكم السريع",
              sections: [
                {
                  title: "👑 أوامر السيطرة والإذاعة",
                  rows: [
                    { id: `${config.prefix}bc`, title: "📢 إذاعة عامة", description: "إرسال رسالة لكل الجروبات المشترك بها البوت" },
                    { id: `${config.prefix}join`, title: "🚪 دخول مجموعة", description: "انضمام البوت لأي جروب فوراً عبر الرابط" },
                    { id: `${config.prefix}leave`, title: "👋 مغادرة المجموعة", description: "خروج البوت من الجروب الحالي فوراً" }
                  ]
                },
                {
                  title: "🛡️ أدوات الإدارة المتقدمة",
                  rows: [
                    { id: `${config.prefix}group close`, title: "🔒 قفل الجروب فوراً", description: "منع الأعضاء من الكتابة داخل الشات" },
                    { id: `${config.prefix}group open`, title: "🔓 فتح الجروب فوراً", description: "السماح لجميع الأعضاء بالكتابة" },
                    { id: `${config.prefix}del`, title: "🗑️ حذف رسالة", description: "حذف أي رسالة مزعجة بالرد عليها" },
                    { id: `${config.prefix}ping`, title: "⚡ فحص سرعة السيرفر", description: "فحص استقرار الخادم وسرعة الرد" },
                    { id: `${config.prefix}profile`, title: "👤 كشف حساب", description: "جلب معلومات وبروفايل أي شخص بالمنشن/الرد" }
                  ]
                }
              ]
            })
          }
        ]
      }
    };

    const msg = generateWAMessageFromContent(from, {
      viewOnceMessage: {
        message: {
          interactiveMessage
        }
      }
    }, { quoted: m });

    await sock.relayMessage(from, msg.message, { messageId: msg.key.id });

  } catch (err) {
    await sock.sendMessage(from, {
      text: `${vipCard}\n\nالأوامر المتاحة:\n* ${config.prefix}bc [رسالة]\n* ${config.prefix}join [رابط]\n* ${config.prefix}leave\n* ${config.prefix}group [open/close]\n* ${config.prefix}del`
    }, { quoted: m });
  }
}
      footer: {
        text: `🛡️ تحكم المطورين - ${config.botName}`
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "⚡ أوامر التحكم السريع",
              sections: [
                {
                  title: "👑 أوامر الإدارة والسيطرة",
                  rows: [
                    { id: `${config.prefix}bc`, title: "📢 إذاعة عامة", description: "إرسال رسالة لكل المجموعات المشترك بها البوت" },
                    { id: `${config.prefix}join`, title: "🚪 دخول مجموعة", description: "انضمام البوت لجروب عبر الرابط" },
                    { id: `${config.prefix}leave`, title: "👋 مغادرة المجموعة", description: "خروج البوت من الجروب الحالي فوراً" }
                  ]
                },
                {
                  title: "🛠️ أدوات المطور الإضافية",
                  rows: [
                    { id: `${config.prefix}del`, title: "🗑️ حذف رسالة", description: "حذف أي رسالة بالرد عليها" },
                    { id: `${config.prefix}ping`, title: "⚡ فحص السيرفر", description: "فحص سرعة واستقرار الاتصال" }
                  ]
                }
              ]
            })
          }
        ]
      }
    };

    const msg = generateWAMessageFromContent(from, {
      viewOnceMessage: {
        message: {
          interactiveMessage
        }
      }
    }, { quoted: m });

    await sock.relayMessage(from, msg.message, { messageId: msg.key.id });

  } catch (err) {
    await sock.sendMessage(from, {
      text: `${vipCard}\n\nالأوامر المتاحة:\n* ${config.prefix}join [رابط]\n* ${config.prefix}leave\n* ${config.prefix}bc [نص]\n* ${config.prefix}del`
    }, { quoted: m });
  }
}
