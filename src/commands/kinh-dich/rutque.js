import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import { getAllQue, getRandomQue, getTypeStyle } from "../../utils/queDich.js";
import { stitchCards } from "../../utils/stitchImages.js";

// ── Nhãn vị trí theo số lá ──────────────────────────────────────────────────
const POSITIONS = {
  3: ["✦ Lá 1 — Quá Khứ", "✦ Lá 2 — Hiện Tại", "✦ Lá 3 — Tương Lai"],
  5: [
    "1️⃣  Vấn đề chính",
    "2️⃣  Yếu tố thúc đẩy",
    "3️⃣  Trở ngại",
    "4️⃣  Lời khuyên",
    "5️⃣  Hướng đi",
  ],
  7: [
    "1️⃣  Tình trạng hiện tại",
    "2️⃣  Nội tâm",
    "3️⃣  Yếu tố bên ngoài",
    "4️⃣  Nguyên nhân sâu xa",
    "5️⃣  Giải pháp",
    "6️⃣  Trợ giúp / Cản trở",
    "7️⃣  Kết luận",
  ],
};

const TITLES = {
  3: "🔮 Trải Bài 3 Lá",
  5: "🔮 Trải Bài 5 Lá — Bức Tranh Toàn Cảnh",
  7: "🔮 Trải Bài 7 Lá — Phân Tích Đa Chiều",
};

// ── Rút N quẻ không trùng ───────────────────────────────────────────────────
function pickUnique(n) {
  const all = getAllQue();
  const picked = [],
    used = new Set();
  while (picked.length < n) {
    const q = all[Math.floor(Math.random() * all.length)];
    if (!used.has(q.id)) {
      used.add(q.id);
      picked.push(q);
    }
  }
  return picked;
}

// ── Command ──────────────────────────────────────────────────────────────────
export default {
  data: new SlashCommandBuilder()
    .setName("rutque")
    .setDescription("🔮 Rút quẻ Kinh Dịch ngẫu nhiên")
    .addIntegerOption((opt) =>
      opt
        .setName("so_la")
        .setDescription("Số lá muốn rút (mặc định: 1)")
        .addChoices(
          { name: "1 lá", value: 1 },
          { name: "3 lá", value: 3 },
          { name: "5 lá", value: 5 },
          { name: "7 lá", value: 7 }
        )
    ),

  async execute(interaction) {
    const soLa = interaction.options.getInteger("so_la") ?? 1;

    // ── 1 lá ────────────────────────────────────────────────────────────────
    if (soLa === 1) {
      const que = getRandomQue();
      const { color, label } = getTypeStyle(que.type);

      const embed = new EmbedBuilder()
        .setTitle("🔮 " + que.full_title)
        .setThumbnail(que.image)
        .setDescription(que.description)
        .setColor(color)
        .addFields({ name: "📊 Phán đoán", value: label, inline: true })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ── 3 / 5 / 7 lá ────────────────────────────────────────────────────────
    await interaction.deferReply();

    try {
      const positions = POSITIONS[soLa];
      const cards = pickUnique(soLa);

      // Ghép ảnh bằng sharp (không cần Python, không cần file local)
      const imageUrls = cards.map((q) => q.image);
      const combinedBuf = await stitchCards(imageUrls);
      const file = new AttachmentBuilder(combinedBuf, { name: "combined.png" });

      // Build embed
      let embed;

      if (soLa === 3) {
        // 3 cột inline
        const fields = cards.map((q, i) => {
          const { label } = getTypeStyle(q.type);
          return {
            name: positions[i],
            value: "**" + q.name + "**\n" + label,
            inline: true,
          };
        });
        embed = new EmbedBuilder()
          .setTitle(TITLES[3])
          .setColor(0x5865f2)
          .addFields(...fields)
          .setImage("attachment://combined.png")
          .setTimestamp();
      } else {
        // 5 hoặc 7 lá: danh sách dọc
        const desc = cards
          .map((q, i) => {
            const { label } = getTypeStyle(q.type);
            return positions[i] + "\n**" + q.name + "** · " + label;
          })
          .join("\n\n");

        embed = new EmbedBuilder()
          .setTitle(TITLES[soLa])
          .setColor(0x5865f2)
          .setDescription(desc)
          .setImage("attachment://combined.png")
          .setTimestamp();
      }

      await interaction.editReply({ embeds: [embed], files: [file] });
    } catch (err) {
      console.error("Lỗi rút quẻ:", err);
      await interaction.editReply(
        "⚠️ Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại!"
      );
    }
  },
};
