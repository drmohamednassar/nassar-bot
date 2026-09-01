// تخزين الجلسات النشطة للألعاب في الذاكرة
const games = new Map();

function renderBoard(board) {
  const symbols = { 0: "1️⃣", 1: "2️⃣", 2: "3️⃣", 3: "4️⃣", 4: "5️⃣", 5: "6️⃣", 6: "7️⃣", 7: "8️⃣", 8: "9️⃣", X: "❌", O: "⭕" };
  const b = board.map((v, i) => (v ? symbols[v] : symbols[i]));
  return `
${b[0]} ┃ ${b[1]} ┃ ${b[2]}
━━━╋━━━╋━━━
${b[3]} ┃ ${b[4]} ┃ ${b[5]}
━━━╋━━━╋━━━
${b[6]} ┃ ${b[7]} ┃ ${b[8]}
`.trim();
}

function checkWinner(b) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let [x, y, z] of winPatterns) {
    if (b[x] && b[x] === b[y] && b[y] === b[z]) return b[x];
  }
  if (b.every(cell => cell !== null)) return "tie";
  return null;
}

export default async function (sock, m, from, args, config) {
  const sender = m.key.participant || m.key.remoteJid;
  const game = games.get(from);
  const action = args[0]?.toLowerCase();

  // 1. بدء لعبة جديدة أو حذف لعبة سابقة
  if (action === "start" || action === "بدء") {
    if (game) return sock.sendMessage(from, { text: "⚠️ هناك لعبة جارية بالفعل في هذا الشات! اكتب `.xo حذف` لإنهائها." }, { quoted: m });

    games.set(from, {
      playerX: sender,
      playerO: null,
      turn: sender,
      board: Array(9).fill(null),
      status: "waiting"
    });

    return sock.sendMessage(from, {
      text: `🎮 *تم إنشاء لعبة إكس-أو (XO) جديدة!*\n\n❌ اللاعب الأول: @${sender.split("@")[0]}\n⭕ اللاعب الثاني: بانتظار لاعب يكتب *.xo انضمام*\n\nاكتب *.xo حذف* لإلغاء اللعبة.`,
      mentions: [sender]
    }, { quoted: m });
  }

  // 2. انضمام اللاعب الثاني
  if (action === "join" || action === "انضمام") {
    if (!game) return sock.sendMessage(from, { text: "⚠️ لا توجد لعبة نشطة حالياً. اكتب `.xo بدء` لإنشاء واحدة." }, { quoted: m });
    if (game.playerO) return sock.sendMessage(from, { text: "⚠️ اكتمل عدد اللاعبين بالفعل!" }, { quoted: m });
    if (game.playerX === sender) return sock.sendMessage(from, { text: "⚠️ أنت مسجل كلاعب أول بالفعل!" }, { quoted: m });

    game.playerO = sender;
    game.status = "playing";

    const boardText = `
🎮 *بدأت المعركة بين اللاعبين:*
❌ @${game.playerX.split("@")[0]}  *ضد*  ⭕ @${game.playerO.split("@")[0]}

${renderBoard(game.board)}

👉 الدور الآن على: @${game.turn.split("@")[0]}
💡 للعب: اكتب رقم الخانة (مثال: *.xo 5*)
`.trim();

    return sock.sendMessage(from, { text: boardText, mentions: [game.playerX, game.playerO, game.turn] }, { quoted: m });
  }

  // 3. حذف اللعبة
  if (action === "delete" || action === "حذف" || action === "انهاء") {
    if (!game) return sock.sendMessage(from, { text: "⚠️ لا توجد لعبة نشطة لحذفها." }, { quoted: m });
    games.delete(from);
    return sock.sendMessage(from, { text: "🗑️ تم إنهاء اللعبة بنجاح." }, { quoted: m });
  }

  // 4. تنفيذ حركة لعب (اختيار رقم من 1 إلى 9)
  const pos = parseInt(args[0]) - 1;
  if (!isNaN(pos) && pos >= 0 && pos <= 8) {
    if (!game || game.status !== "playing") {
      return sock.sendMessage(from, { text: "⚠️ لا توجد مباراة قيد التشغيل. اكتب `.xo بدء` أولاً." }, { quoted: m });
    }

    if (sender !== game.turn) {
      return sock.sendMessage(from, { text: `⚠️ ليس دورك الآن! الدور على @${game.turn.split("@")[0]}`, mentions: [game.turn] }, { quoted: m });
    }

    if (game.board[pos] !== null) {
      return sock.sendMessage(from, { text: "⚠️ هذه الخانة ممتلئة بالفعل، اختر خانة أخرى فارغة!" }, { quoted: m });
    }

    // تسجيل الرمز في الخانة
    const symbol = sender === game.playerX ? "X" : "O";
    game.board[pos] = symbol;

    // فحص الفائز
    const result = checkWinner(game.board);

    if (result) {
      games.delete(from);
      if (result === "tie") {
        return sock.sendMessage(from, {
          text: `🤝 *تعادل! انتهت اللعبة بدون فائز.*\n\n${renderBoard(game.board)}`
        }, { quoted: m });
      } else {
        const winner = result === "X" ? game.playerX : game.playerO;
        return sock.sendMessage(from, {
          text: `🎉 *مبروك الفوز يا أسطورة!* 🏆\n\nالفائز: @${winner.split("@")[0]} (${result === "X" ? "❌" : "⭕"})\n\n${renderBoard(game.board)}`,
          mentions: [winner]
        }, { quoted: m });
      }
    }

    // تبديل الدور
    game.turn = game.turn === game.playerX ? game.playerO : game.playerX;

    const nextText = `
${renderBoard(game.board)}

👉 الدور الآن على: @${game.turn.split("@")[0]}
💡 اكتب: *.xo [رقم من 1 إلى 9]*
`.trim();

    return sock.sendMessage(from, { text: nextText, mentions: [game.turn] }, { quoted: m });
  }

  // رسالة المساعدة في حال كتابة .xo بدون مدخلات
  const helpText = `
🎮 *طريقة لعب إكس-أو (XO):*

1️⃣ *.xo بدء* : لبدء لعبة جديدة
2️⃣ *.xo انضمام* : لانضمام اللاعب الثاني
3️⃣ *.xo [1-9]* : لاختيار رقم الخانة للعب
4️⃣ *.xo حذف* : لإنهاء اللعبة
`.trim();

  await sock.sendMessage(from, { text: helpText }, { quoted: m });
}
