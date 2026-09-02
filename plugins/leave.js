export default async function (sock, m, from, args, config = {}) {
  try {
    // 1. استخراج معرّف المرسل بدقة ودعم معرّفات LID وحساب البوت
    const rawSender = m.sender || m.key.participant || (m.key.fromMe ? sock.user?.id : from) || "";
    const cleanSender = rawSender.split("@")[0].replace(/[^0-9]/g, "");
    const cleanPn = (m.key?.participantPn || m.key?.remoteJidPn || "").split("@")[0].replace(/[^0-9]/g, "");

    // 2. قائمة المعرّفات المصرح لها (المطورين وحسابات VIP)
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

    // 3. تحديد الجروب المستهدف (سواء الجروب الحالي أو معرف تم تمريره في الخاص)
    let targetGroup = from;
    if (!from.endsWith("@g.us")) {
      if (args[0] && args[0].endsWith("@g.us")) {
        targetGroup = args[0];
      } else {
        return sock.sendMessage(from, { 
          text: "⚠️ هذا الأمر يعمل داخل المجموعة مباشرة، أو بكتابة معرف الجروب بعد الأمر في الخاص.\nمثال: *.leave 123456789-xxxx@g.us*" 
        }, { quoted: m });
      }
    }

    // إرسال رسالة وداع قبل الخروج
    await sock.sendMessage(targetGroup, { 
      text: "👋 مع السلامة! تم تنفيذ أمر المغادرة بواسطة المطور." 
    });

    // تأخير نصف ثانية لضمان تسليم الرسالة قبل إنهاء الاتصال بالجروب
    await new Promise((resolve) => setTimeout(resolve, 500));

    // مغادرة المجموعة
    await sock.groupLeave(targetGroup);

    // تأكيد للمطور إذا نفذ الأمر من المحادثة الخاصة
    if (from !== targetGroup) {
      await sock.sendMessage(from, { text: `✅ تمت مغادرة المجموعة بنجاح:\n\`${targetGroup}\`` }, { quoted: m });
    }

  } catch (err) {
    console.error("Leave Error:", err);
    await sock.sendMessage(from, { 
      text: "❌ تعذر الخروج من المجموعة. تأكد من أن البوت عضو فيها حالياً." 
    }, { quoted: m });
  }
}
