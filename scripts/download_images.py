#!/usr/bin/env python3
"""
Tải 64 ảnh quẻ Kinh Dịch về thư mục assets/images/
Chạy 1 lần: python scripts/download_images.py
"""
import json
import os
import time
import urllib.request

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH  = os.path.join(BASE_DIR, '64QueKinhDich.json')
IMAGES_DIR = os.path.join(BASE_DIR, 'assets', 'images')

os.makedirs(IMAGES_DIR, exist_ok=True)

# ── Headers giả lập trình duyệt thật ─────────────────────────────────────────
HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept':          'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer':         'https://dich.kabala.vn/',
    'Connection':      'keep-alive',
}

def download(url: str, dest: str) -> None:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        with open(dest, 'wb') as f:
            f.write(resp.read())

# ── Main ──────────────────────────────────────────────────────────────────────
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'📦 Bắt đầu tải {len(data)} ảnh vào {IMAGES_DIR}\n')

ok = skip = err = 0

for que in data:
    num  = que['id'] + 1        # 1-indexed: 1.png … 64.png
    url  = que['image']
    dest = os.path.join(IMAGES_DIR, f'{num}.png')

    if os.path.exists(dest):
        print(f'  [SKIP] {num:>2}.png – {que["name"]}')
        skip += 1
        continue

    try:
        print(f'  [DL]   {num:>2}.png – {que["name"]} ...', end=' ', flush=True)
        download(url, dest)
        print('OK')
        ok += 1
        time.sleep(0.15)        # nhẹ tay với server
    except Exception as e:
        print(f'LỖI: {e}')
        err += 1

print(f'\n✅ Xong! Tải mới: {ok} | Bỏ qua: {skip} | Lỗi: {err}')
