export default async function (sock, m, from, args) {
  const type = args[0]?.toLowerCase();
  const truths = [
    "ما هو أكثر شيء تندم عليه في حياتك؟",
    "من هو الشخص الذي لا تستطيع تخيل حياتك بدونه؟",
    "ما هو أكبر سر تخفيه عن أصدقائك المقربين؟",
    "هل مررت بموقف محرج جداً لا تنساه أبداً؟",
    "ما هي أسوأ كذبة قلتها في حياتك ونجوت منها؟"
  ];
  const dares = [
    "أرسل آخر صورة موجودة في معرض هاتفك في الجروب الآن.",
    "اكتب رسالة لأول شخص في محادثاتك: 'أنا محتاج مساعدتك ضروري' وصور الرد.",
    "غيّر اسمك في الجروب إلى 'كائن فضائي' لمدة 12 ساعة.",
    "سجل مقطع صوتي تغني فيه أغنية أطفال وأرسله في الشات.",
    "ضع إيموجي مضحك على آخر 5 رسائل في الجروب."
  ];

  if (type === "صراحة" || type === "truth") {
    const q = truths[Math.floor(Math.random() * truths.length)];
    await sock.sendMessage(from, { text: `❓ *سؤال صراحة:*\n\n${q}` }, { quoted: m });
  } else if (type === "تحدي" || type === "جرأة" || type === "dare") {
    const d = dares[Math.floor(Math.random() * dares.length)];
    await sock.sendMessage(from, { text: `🔥 *تحدي جرأة:*\n\n${d}` }, { quoted: m });
  } else {
    await sock.sendMessage(from, { text: "⚠️ حدد نوع التحدي:\n* .tod صراحة\n* .tod تحدي" }, { quoted: m });
  }
}
