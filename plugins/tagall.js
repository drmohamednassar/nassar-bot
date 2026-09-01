export default async function (sock, m, from, args) {
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ هذا الأمر مخصص للمجموعات فقط!" }, { quoted: m });

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;
    const customMessage = args.join(" ") || "انتباه للجميع 📢";

    let tagText = `📢 *${customMessage}*\n👥 *العدد:* ${participants.length}\n\n`;
    for (let mem of participants) {
      tagText += `🔹 @${mem.id.split("@")[0]}\n`;
    }

    await sock.sendMessage(from, { 
      text: tagText.trim(), 
      mentions: participants.map(a => a.id) 
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر إرسال المنشن." }, { quoted: m });
  }
}
