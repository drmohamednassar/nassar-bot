export default async function (sock, m, from, args, config) {
  const start = Date.now();
  await sock.sendMessage(from, { text: "⚡ جاري الفحص..." }, { quoted: m });
  const latency = Date.now() - start;
  await sock.sendMessage(from, { 
    text: `🚀 استجابة السيرفر: *${latency}ms*\n👑 المطور: *${config.ownerName}*` 
  }, { quoted: m });
}
