#!/usr/bin/env python3
"""
Ghép N ảnh quẻ thành lưới nhiều hàng.
Usage: python scripts/stitch.py <id1> <id2> ... <idN> <output_path>
  Layout tự động:
    3 ảnh → 1 hàng × 3
    5 ảnh → hàng 1: 3 | hàng 2: 2 (căn giữa)
    7 ảnh → hàng 1: 4 | hàng 2: 3 (căn giữa)
"""
import sys
import os
import math
from PIL import Image

# ── Config ────────────────────────────────────────────────────────────────────
CARD_H    = 200       # chiều cao mỗi ảnh
GAP_X     = 20        # khoảng cách ngang giữa ảnh
GAP_Y     = 20        # khoảng cách dọc giữa hàng
PADDING   = 24        # padding 4 phía
BG_COLOR  = (255, 255, 255)

# ── Layout map ────────────────────────────────────────────────────────────────
LAYOUTS = {
    1: [[1]],
    2: [[2]],
    3: [[3]],
    5: [[3], [2]],
    7: [[4], [3]],
}

def get_layout(n):
    if n in LAYOUTS:
        return LAYOUTS[n]
    # Fallback: hàng tối đa 4
    rows, rem = divmod(n, 4)
    layout = [[4]] * rows
    if rem:
        layout.append([rem])
    return layout

def add_white_bg(img):
    if img.mode in ('RGBA', 'LA', 'P'):
        bg = Image.new('RGBA', img.size, (255, 255, 255, 255))
        img = img.convert('RGBA')
        bg.paste(img, mask=img.split()[3])
        return bg.convert('RGB')
    return img.convert('RGB')

def load_and_resize(path):
    img = Image.open(path)
    img = add_white_bg(img)
    ratio = CARD_H / img.height
    new_w = int(img.width * ratio)
    return img.resize((new_w, CARD_H), Image.LANCZOS)

def stitch(ids, output_path):
    base_dir   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    images_dir = os.path.join(base_dir, 'assets', 'images')

    cards = []
    for id_ in ids:
        path = os.path.join(images_dir, f'{id_}.png')
        if not os.path.exists(path):
            raise FileNotFoundError(f'Không tìm thấy: {path}')
        cards.append(load_and_resize(path))

    layout = get_layout(len(ids))
    card_w = max(c.width for c in cards)   # dùng chiều rộng lớn nhất để căn đều

    # Tính kích thước canvas
    max_cols = max(row[0] for row in layout)
    n_rows   = len(layout)
    total_w  = max_cols * card_w + (max_cols - 1) * GAP_X + PADDING * 2
    total_h  = n_rows * CARD_H + (n_rows - 1) * GAP_Y + PADDING * 2

    canvas = Image.new('RGB', (total_w, total_h), BG_COLOR)

    card_idx = 0
    y = PADDING

    for row_spec in layout:
        cols = row_spec[0]
        row_cards = cards[card_idx: card_idx + cols]
        card_idx += cols

        # Căn giữa hàng có ít ảnh hơn hàng đầu
        row_total_w = sum(c.width for c in row_cards) + GAP_X * (cols - 1)
        x_start = (total_w - row_total_w) // 2

        x = x_start
        for card in row_cards:
            canvas.paste(card, (x, y))
            x += card.width + GAP_X

        y += CARD_H + GAP_Y

    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    canvas.save(output_path, 'PNG', optimize=True)
    print(output_path)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: python stitch.py <id1> ... <idN> <output_path>', file=sys.stderr)
        sys.exit(1)

    *raw_ids, out = sys.argv[1:]
    ids = [int(i) for i in raw_ids]
    stitch(ids, out)
