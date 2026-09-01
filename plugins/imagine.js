export default async function (sock, m, from, args, config) {
  const prompt = args.join(" ");
  if (!prompt) return sock.sendMessage(from, { text: "⚠️ اكتب وصف الصورة بالإنجليزية بعد الأمر.\nمثال: .imagine a futuristic city in neon colors" }, { quoted: m });

  try {
    await sock.sendMessage(from, { text: "🎨 جاري رسم وتوليد الصورة بالذكاء الاصطناعي..." }, { quoted: m });
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
    
    await sock.sendMessage(from, {
      image: { url: imageUrl },
      caption: `🎨 *الوصف:* ${prompt}\n\n👑 تم الإنشاء بواسطة *${config.botName}*`
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر توليد الصورة، يرجى المحاولة لاحقاً." }, { quoted: m });
  }
}
