export default async function (sock, m, from, args) {
  const text = args.join(" ");
  if (!text) return sock.sendMessage(from, { text: "⚠️ اكتب النص المراد تحويله لصوت.\nمثال: .tts مرحباً بكم في سورس نصار" }, { quoted: m });

  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodeURIComponent(text)}`;
  await sock.sendMessage(from, {
    audio: { url: audioUrl },
    mimetype: "audio/mp4",
    ptt: true
  }, { quoted: m });
}
