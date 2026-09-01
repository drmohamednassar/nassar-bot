export default async function (sock, m, from, args, config) {
  // معرفة رقم الشخص الذي أرسل الأمر
  const senderNumber = (m.key.participant || m.key.remoteJid).split("@")[0];

  // التحقق هل الرقم مسجل في قائمة المطورين
  if (!config.sudo.includes(senderNumber)) {
    return sock.sendMessage(from, { text: "⛔ هذا الأمر مخصص للمطور فقط!" }, { quoted: m });
  }

  const link = args[0];
  if (!link || !link.includes("chat.whatsapp.com/")) {
    return sock.sendMessage(from, { text: "⚠️ يرجى إرسال رابط جروب صالح.\nمثال: .join https://chat.whatsapp.com/xxxxxx" }, { quoted: m });
  }

  try {
    const code = link.split("chat.whatsapp.com/")[1].trim();
    await sock.groupAcceptInvite(code);
    await sock.sendMessage(from, { text: "✅ تم الانضمام للمجموعة بنجاح!" }, { quoted: m });
  } catch (err) {
    await sock.sendMessage(from, { text: "❌ فشل الانضمام. تأكد من صحة الرابط أو صلاحية الدعوة." }, { quoted: m });
  }
}
