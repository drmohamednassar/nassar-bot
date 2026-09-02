export default async function (sock, m, from, args, config = {}) {
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

  const input = args[0] || (m.quoted?.text ? m.quoted.text : "");

  // استخراج كود الدعوة بدقة عبر Regex حتى لو كان الرابط يحتوي على معلمات إضافية (?s=cl...)
  const match = input.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);

  if (!match || !match[1]) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى إرسال رابط جروب صالح أو الرد عليه بالأمر.\nمثال: *.join https://chat.whatsapp.com/ENY1WxbgzCj6Tk5r896IiW*" 
    }, { quoted: m });
  }

  const inviteCode = match[1];

  try {
    const res = await sock.groupAcceptInvite(inviteCode);
    if (!res) {
      return sock.sendMessage(from, { text: "⚠️ البوت موجود بالفعل داخل هذا الجروب!" }, { quoted: m });
    }
    await sock.sendMessage(from, { text: "✅ تم الانضمام للمجموعة بنجاح!" }, { quoted: m });
  } catch (err) {
    console.error("Join Error:", err);
    await sock.sendMessage(from, { 
      text: "❌ فشل الانضمام. تأكد من أن الرابط صالح وغير منتهي الصلاحية، أو أن الجروب لا يتطلب موافقة يدوية من المشرف." 
    }, { quoted: m });
  }
}
