# Tích hợp Feature Game Nối Từ

## 1. Context hiện tại

Project đã có sẵn Discord bot Node.js/discord.js và hệ thống dynamic command/event.

Structure hiện tại:

```text
src/
├── index.js              # auto-scan commands/events
├── deploy-commands.js    # đăng ký slash commands
├── commands/
│   ├── boi/
│   │   └── boi.js
│   ├── que/
│   │   ├── tra-que.js
│   │   └── ngau-nhien.js
│   └── info/
│       └── help.js
├── events/
└── utils/
    └── queDich.js
```

Bot đã có:

- Dynamic command scanning.
- Dynamic event scanning.
- Slash command system.
- Prefix command system.
- `deploy-commands.js` để đăng ký slash commands.

**Không tạo bot mới.**

**Không tạo Discord Client mới.**

**Không tạo command handler/event handler mới.**

**Không refactor các feature hiện tại nếu không cần thiết.**

Hãy inspect code hiện tại và tích hợp feature mới theo architecture đang có.

---

# 2. Feature cần thêm

Thêm game **Nối Từ tiếng Việt**.

Dictionary lấy từ:

```text
words.txt
```

Nếu project chưa có thư mục phù hợp, có thể đặt:

```text
data/words.txt
```

Nhưng hãy kiểm tra project trước và chọn vị trí hợp lý.

File có khoảng 53.000 dòng.

Format mỗi dòng:

```text
<từ_1> <từ_2>
```

Ví dụ:

```text
áo mưa
áo não
áo nậu
áo nẹp
áo ngự
áo nhộng
áo nịt
áo nước
áo phao
áo phông
áo quan
áo quần
áo rét
áo rộng
áo sô
```

Nghĩa là:

```text
áo → mưa
áo → não
áo → nậu
...
```

---

# 3. Dictionary

Load `words.txt` **một lần khi bot khởi động**.

Không đọc file lại mỗi khi người chơi gửi message.

Dùng cấu trúc tương tự:

```js
Map<string, Set<string>>
```

Ví dụ:

```js
{
    "áo": Set([
        "mưa",
        "não",
        "nậu",
        "nẹp",
        "ngự",
        "nhộng",
        "nịt",
        "nước",
        "phao",
        "phông",
        "quan",
        "quần",
        "rét",
        "rộng",
        "sô"
    ])
}
```

Normalize dữ liệu:

```js
trim();
toLocaleLowerCase("vi-VN");
```

Phải hỗ trợ Unicode tiếng Việt.

Nên tạo utility/service riêng cho dictionary, ví dụ tùy architecture hiện tại:

```text
src/utils/wordDictionary.js
```

hoặc:

```text
src/services/wordDictionary.js
```

Không bắt buộc đúng tên trên; hãy theo convention hiện tại của project.

---

# 4. Không dùng database

Không thêm database cho feature này.

Game state lưu trong RAM.

Dùng:

```js
Map<guildId, GameSession>
```

Ví dụ:

```js
const games = new Map();
```

Mỗi guild chỉ được có một game.

Bot restart thì game hiện tại mất, điều này được chấp nhận.

Dictionary `words.txt` vẫn được load lại khi bot restart.

---

# 5. Commands

## Prefix command

Thêm:

```text
!noitu
```

`!noitu` luôn bắt đầu game:

```text
mode = "bot"
```

Tức là chơi với bot.

---

## Slash command

Thêm:

```text
/noitu
```

Có option:

```text
mode
```

Choices:

```text
bot
player
```

Ví dụ:

```text
/noitu mode:bot
/noitu mode:player
```

### bot mode

Người chơi trong server cùng chơi với bot.

### player mode

Người chơi với nhau, bot chỉ quản lý luật.

---

# 6. Stop command

Thêm slash command:

```text
/noitu-stop
```

Dùng để kết thúc game hiện tại.

Nếu không có game:

```text
Không có game nối từ đang chạy.
```

Nếu có game:

```text
🛑 Game nối từ đã kết thúc.
```

Sau đó remove game khỏi:

```js
Map<guildId, GameSession>
```

---

# 7. Một guild chỉ có một game

Game phải được quản lý theo:

```text
guildId
```

Nếu guild đang có game mà user chạy:

```text
!noitu
```

hoặc:

```text
/noitu
```

thì không tạo game mới.

Thông báo:

```text
❌ Server này đang có một game nối từ.
```

---

# 8. GameSession

Tạo class/service/module phù hợp với architecture hiện tại.

GameSession cần có tối thiểu:

```js
{
  guildId,
    channelId,
    mode,
    currentWord,
    usedPhrases,
    wrongAttempts,
    lockedPlayers,
    players,
    lastCorrectUserId,
    startedAt,
    finished;
}
```

Trong đó:

```js
usedPhrases: Set<string>
```

```js
wrongAttempts: Map<userId, number>
```

```js
lockedPlayers: Set<userId>
```

```js
players: Set<userId>
```

---

# 9. Channel

Game được tạo trong channel mà command được gọi.

Chỉ xử lý message trong channel đó.

Message ở channel khác trong cùng guild phải bỏ qua.

---

# 10. Bắt đầu game

Khi bắt đầu, lấy một phrase hợp lệ ngẫu nhiên từ dictionary.

Ví dụ:

```text
cây kéo
```

Phrase này được đưa vào:

```text
usedPhrases
```

Sau đó:

```text
currentWord = "kéo"
```

Bot gửi:

```text
🎮 Game nối từ bắt đầu!

Từ đầu tiên: cây kéo

Từ tiếp theo phải bắt đầu bằng: kéo
```

---

# 11. Câu trả lời

Người chơi luôn phải trả lời bằng **đúng 2 tiếng**.

Ví dụ current word:

```text
kéo
```

Câu hợp lệ:

```text
kéo cắt
```

Câu không hợp lệ:

```text
kéo
```

hoặc:

```text
kéo cắt giấy
```

---

# 12. Correct answer

Nếu:

```text
currentWord = "kéo"
```

User gửi:

```text
kéo cắt
```

và phrase chưa từng xuất hiện:

→ đúng.

Thực hiện:

```text
React message: ✅
```

Sau đó:

```js
usedPhrases.add("kéo cắt");
currentWord = "cắt";
lastCorrectUserId = userId;
```

Reset:

```js
wrongAttempts.clear();
lockedPlayers.clear();
```

---

# 13. Wrong answer

Nếu current word:

```text
kéo
```

nhưng user gửi:

```text
ngôi nhà
```

→ sai vì `ngôi !== kéo`.

React:

```text
❌
```

Thông báo:

```text
⚠️ Từ hiện tại phải bắt đầu bằng "kéo".
```

Tăng:

```js
wrongAttempts[userId];
```

---

# 14. Sai format

Nếu user gửi:

```text
kéo
```

hoặc:

```text
kéo cắt giấy
```

→ sai.

React:

```text
❌
```

Thông báo:

```text
❌ Câu trả lời phải gồm đúng 2 tiếng.
```

Cũng tính là một lần sai.

---

# 15. Phrase đã được sử dụng

Trong một session, một phrase chỉ được xuất hiện **một lần**.

Ví dụ:

```text
cây kéo
kéo cắt
cắt giấy
```

đã xuất hiện thì không được dùng lại.

Nếu user gửi phrase đã dùng:

```text
❌
```

Thông báo:

```text
⚠️ Phrase này đã được sử dụng trong game.
```

Tính là một lần sai.

---

# 16. Sai 5 lần liên tiếp

Mỗi user có counter riêng trên `currentWord`.

Ví dụ:

```text
currentWord = "kéo"
```

User A:

```text
1 → sai
2 → sai
3 → sai
4 → sai
5 → sai
```

Sau lần thứ 5:

```text
lockedPlayers.add(userA)
```

Thông báo:

```text
🔒 Bạn đã sai 5 lần liên tiếp và bị khóa ở từ "kéo".
```

User bị lock không được tiếp tục trả lời current word.

---

# 17. Unlock

Nếu một người khác trả lời đúng:

```text
kéo cắt
```

thì:

```text
currentWord = "cắt"
```

và:

```js
wrongAttempts.clear();
lockedPlayers.clear();
```

Tất cả player bị lock ở từ cũ được unlock.

---

# 18. 3 người bị lock

Nếu **3 user khác nhau** bị lock tại cùng một current word:

```text
A → 5 lần sai → LOCK
B → 5 lần sai → LOCK
C → 5 lần sai → LOCK
```

→ game kết thúc.

Winner:

```text
lastCorrectUserId
```

Tức người trả lời đúng gần nhất trước đó.

Thông báo:

```text
🏆 Game kết thúc!

Có 3 người bị khóa.

Người chiến thắng: @user
```

Phải là **3 người khác nhau**, không phải 3 lần sai.

---

# 19. Hết từ

Nếu `currentWord` không còn phrase hợp lệ nào chưa sử dụng:

```text
currentWord
    ↓
không có candidate
```

→ game kết thúc.

Winner:

```text
lastCorrectUserId
```

Thông báo:

```text
🏆 Game kết thúc!

Không còn từ phù hợp để nối.

Người chiến thắng: @user
```

---

# 20. Bot mode

Với:

```text
!noitu
```

hoặc:

```text
/noitu mode:bot
```

sau khi player trả lời đúng, bot tự động tìm phrase tiếp theo.

Ví dụ:

```text
User:
kéo cắt

Bot:
cắt giấy
```

Bot phải:

1. Tìm candidate bắt đầu bằng `currentWord`.
2. Không được chọn phrase đã sử dụng.
3. Thêm phrase vào `usedPhrases`.
4. Update `currentWord`.

Nếu bot không còn nước:

```text
🏆 @user thắng!

Bot không còn từ để nối.
```

---

# 21. Player mode

Với:

```text
/noitu mode:player
```

bot không tự trả lời.

Bot chỉ:

- validate
- react
- update state
- quản lý wrong attempts
- lock/unlock
- chuyển current word
- xác định winner
- kết thúc game

---

# 22. React

Chỉ dùng:

Đúng:

```text
✅
```

Sai:

```text
❌
```

React trực tiếp vào message của user.

Không cần các reaction khác.

---

# 23. Không xử lý bot messages

Message từ bot phải được bỏ qua để tránh bot tự trigger game handler:

```js
if (message.author.bot) return;
```

Tận dụng event/message handler hiện tại nếu đã có.

Không tạo event handler song song nếu không cần.

---

# 24. Bot AI và dead-end

Trong bot mode, nếu có nhiều candidate:

```text
kéo cắt
kéo...
kéo...
```

bot có thể chọn random.

Tuy nhiên nên ưu tiên candidate mà từ tiếp theo vẫn còn candidate.

Ví dụ:

```text
áo nậu
```

nhưng `nậu` không có từ tiếp theo.

Nếu vẫn có:

```text
áo mưa
mưa rào
```

thì ưu tiên `áo mưa`.

Không cần AI phức tạp.

---

# 25. Tích hợp với architecture hiện tại

Đây là yêu cầu quan trọng nhất.

Project hiện tại đã có dynamic architecture:

```text
src/
├── index.js
├── deploy-commands.js
├── commands/
└── events/
```

Hãy:

### Commands

Thêm command theo convention hiện tại, ví dụ:

```text
src/commands/noitu/noitu.js
src/commands/noitu/noitu-stop.js
```

**Nhưng trước tiên inspect các command hiện tại để xác định naming/export convention chính xác.**

Không tự giả định structure nếu codebase đang có convention khác.

### Utils / Services

Dictionary và game logic nên tách khỏi Discord command.

Ví dụ có thể dùng:

```text
src/utils/wordDictionary.js
src/utils/wordChainGame.js
```

hoặc structure tương ứng với project hiện tại.

Không nhét toàn bộ game logic vào `noitu.js`.

### Events

Tận dụng event handler/message handler hiện tại.

Nếu đã có `messageCreate` handler thì thêm logic vào handler/service phù hợp.

Không tạo nhiều `messageCreate` listener không cần thiết.

---

# 26. Không ảnh hưởng feature hiện tại

Các command hiện tại:

```text
/boi
/tra-que
/ngau-nhien
/help
```

phải tiếp tục hoạt động bình thường.

Không thay đổi behavior của các feature hiện tại.

---

# 27. Acceptance Criteria

Feature hoàn thành khi:

- [ ] Không tạo bot/project mới.
- [ ] Tận dụng dynamic command/event architecture hiện tại.
- [ ] Load được ~53.000 dòng `words.txt`.
- [ ] Dictionary được load một lần vào RAM.
- [ ] `!noitu` → bot mode.
- [ ] `/noitu mode:bot` → bot mode.
- [ ] `/noitu mode:player` → player mode.
- [ ] `/noitu-stop` → kết thúc game.
- [ ] Một guild chỉ có 1 game.
- [ ] Một channel được gắn với game session.
- [ ] Mỗi phrase chỉ dùng 1 lần/session.
- [ ] Answer phải đúng 2 tiếng.
- [ ] Tiếng đầu tiên phải khớp `currentWord`.
- [ ] Đúng → `✅`.
- [ ] Sai → `❌`.
- [ ] Sai prefix → có warning.
- [ ] Sai 5 lần liên tiếp → lock player.
- [ ] 3 player khác nhau bị lock → game over.
- [ ] Answer đúng → chuyển word và unlock.
- [ ] Hết candidate → người đúng cuối cùng thắng.
- [ ] Bot mode tự động trả lời.
- [ ] Player mode không tự trả lời.
- [ ] Bot không xử lý message của chính nó.
- [ ] Restart bot không cần migration/database.
- [ ] Các feature hiện tại không bị ảnh hưởng.

---

# 28. Implementation instruction

**Trước khi viết code, hãy inspect toàn bộ structure liên quan đến command/event của project hiện tại.**

Sau đó:

1. Xác định command convention.
2. Xác định event/message convention.
3. Xác định cách `deploy-commands.js` scan/register command.
4. Xác định nơi phù hợp để load dictionary.
5. Implement dictionary.
6. Implement GameSession/GameManager.
7. Integrate prefix `!noitu`.
8. Integrate `/noitu`.
9. Integrate `/noitu-stop`.
10. Integrate message processing.
11. Implement toàn bộ game rules.
12. Test các edge cases.

**Không cần hỏi lại về việc tạo bot. Bot đã tồn tại. Đây chỉ là một feature mới được tích hợp vào bot hiện tại.**
