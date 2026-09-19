# 🔮 Kinh Dịch Discord Bot

Bot Discord tra cứu và rút quẻ Kinh Dịch với 64 quẻ đầy đủ.

---

## ⚡ Deploy nhanh (Docker)

### Yêu cầu
- Docker + Docker Compose
- File `.env` đã điền đủ thông tin

### Chạy
```bash
# Clone về server
git clone <repo> && cd KinhDich

# Chạy bot (lần đầu sẽ tự tải 64 ảnh quẻ ~vài phút)
docker compose up -d

# Xem log
docker compose logs -f

# Dừng bot
docker compose down
```

### Cập nhật code
```bash
git pull
docker compose up -d --build
```

---

## 🛠 Chạy local (không Docker)

### Yêu cầu
- Node.js 22+
- Python 3.9+

### Cài đặt
```bash
npm install
pip install Pillow
```

### Tải ảnh (1 lần)
```bash
npm run download:images
```

### Deploy slash commands
```bash
npm run deploy
```

### Khởi động
```bash
npm start
```

---

## 📁 Cấu trúc

```
src/
├── index.js               # Entry point
├── deploy-commands.js     # Đăng ký slash commands
├── commands/              # Slash commands (1 file = 1 lệnh)
│   └── kinh-dich/
│       └── rutque.js      # /rutque
├── prefix/                # Prefix commands !
│   └── rutque.js
├── events/                # Discord events
└── utils/
    └── queDich.js         # Helper dữ liệu quẻ

scripts/
├── download_images.py     # Tải 64 ảnh về local
└── stitch.py             # Ghép ảnh ngang (Python + Pillow)

assets/images/             # 64 ảnh quẻ (1.png → 64.png)
```

---

## 🃏 Lệnh bot

| Lệnh | Mô tả |
|---|---|
| `/ping` hoặc `!ping` | Kiểm tra bot còn sống |
| `/rutque` | Rút 1 quẻ ngẫu nhiên |
| `/rutque so_la:3` | Trải bài 3 lá (Quá Khứ / Hiện Tại / Tương Lai) |
| `/rutque so_la:5` | Trải bài 5 lá (Bức tranh toàn cảnh) |
| `/rutque so_la:7` | Trải bài 7 lá (Phân tích đa chiều) |
| `!rutque` | Rút 1 quẻ bằng prefix |

---

## ➕ Thêm lệnh mới

**Slash command**: Tạo file `src/commands/<category>/<ten>.js` → `npm run deploy`

**Prefix command**: Tạo file `src/prefix/<ten>.js` → restart bot

---

## 🔧 Biến môi trường (`.env`)

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
```

