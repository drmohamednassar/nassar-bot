export default async function (sock, m, from, args, config) {
  const menuText = `
╭━━━〔 *${config.botName}* 〕━━━╮
┃ 👑 المطور: *${config.ownerName}*
┃ ⚙️ علامة الأوامر: [ *${config.prefix}* ]
╰━━━━━━━━━━━━━━━━╯

📥 *أوامر التحميل والميديا:*
* ${config.prefix}tiktok [رابط] : تحميل فيديو تيك توك بدون علامة
* ${config.prefix}ig [رابط] : تحميل ريلز وبوستات إنستغرام

🤖 *أوامر الذكاء الاصطناعي:*
* ${config.prefix}ai [سؤالك] : محادثة مع الذكاء الاصطناعي GPT

👥 *أوامر إدارة المجموعات:*
* ${config.prefix}tagall [نص] : منشن لكل أعضاء الجروب
* ${config.prefix}hidetag [نص] : منشن مخفي للجميع
* ${config.prefix}kick [@منشن / رد] : طرد عضو من الجروب
* ${config.prefix}promote [@منشن / رد] : رفع عضو لرتبة مشرف
* ${config.prefix}demote [@منشن / رد] : تنزيل مشرف لعضو عادي
* ${config.prefix}link : جلب رابط دعوة الجروب

🕋 *الأوامر الإسلامية:*
* ${config.prefix}quran : آية عشوائية من القرآن الكريم
* ${config.prefix}azkar : أذكار وأدعية مأثورة

💡 *أوامر عامة وترفيهية:*
* ${config.prefix}calc [عملية حسابية] : آلة حاسبة ذكية
* ${config.prefix}quote : حكمة واقتباس عشوائي
* ${config.prefix}joke : نكتة مضحكة
* ${config.prefix}fact : معلومة وحقيقة علمية
* ${config.prefix}ping : فحص سرعة واستجابة السيرفر
`;
  await sock.sendMessage(from, { text: menuText.trim() }, { quoted: m });
}
