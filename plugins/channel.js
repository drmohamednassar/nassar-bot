export default async function (sock, m, from, args, config) {
  const channelLink = "https://chat.whatsapp.com/ENY1WxbgzCj6Tk5r896IiW";
  const channelName = "سورس محمد نصار | Official Channel";

  const text = 
    `📢 *قناة التحديثات الرسمية* 📢\n\n` +
    `تابعنا للحصول على آخر التحديثات، الميزات، والإضافات الخاصة بالبوت أولاً بأول ✨\n\n` +
    `🔗 *رابط الانضمام:*\n${channelLink}\n\n` +
    `💡 _انقر على الرابط للانضمام ومتابعة كل جديد._`;

  try {
    await sock.sendMessage(from, {
      text: text.trim(),
      contextInfo: {
        externalAdReply: {
          title: channelName,
          body: "اضغط هنا للانضمام",
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: channelLink
        }
      }
    }, { quoted: m });
  } catch (error) {
    console.error("Channel Command Error:", error);
    await sock.sendMessage(from, { 
      text: text.trim() 
    }, { quoted: m });
  }
}
