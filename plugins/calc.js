export default async function (sock, m, from, args) {
  const query = args.join(" ");
  if (!query) return sock.sendMessage(from, { text: "⚠️ اكتب العملية الحسابية.\nمثال: .calc 50 * 2 + 10" }, { quoted: m });

  try {
    const sanitized = query.replace(/[^0-9+\-*/().]/g, "");
    const result = Function(`'use strict'; return (${sanitized})`)();
    await sock.sendMessage(from, { text: `🧮 *العملية:* ${query}\n📊 *النتيجة:* *${result}*` }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ صيغة المعادلة الحسابية غير صحيحة." }, { quoted: m });
  }
}
