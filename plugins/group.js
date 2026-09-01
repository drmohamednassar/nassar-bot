export default async function (sock, m, from, args) {
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ هذا الأمر للمجموعات فقط!" }, { quoted: m });

  const action = args[0]?.toLowerCase();
  if (action === "close" || action === "قفل") {
    await sock.groupSettingUpdate(from, "announcement");
    await sock.sendMessage(from, { text: "🔒 تم قفل المجموعة (الإرسال متاح للمشرفين فقط)." }, { quoted: m });
  } else if (action === "open" || action === "فتح") {
    await sock.groupSettingUpdate(from, "not_announcement");
    await sock.sendMessage(from, { text: "🔓 تم فتح المجموعة لجميع الأعضاء." }, { quoted: m });
  } else {
    await sock.sendMessage(from, { text: "⚠️ الاستخدام الصحيح:\n* .group open (لفتح الجروب)\n* .group close (لقفل الجروب)" }, { quoted: m });
  }
}
