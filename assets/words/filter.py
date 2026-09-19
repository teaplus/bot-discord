input_file = "input.txt"
output_file = "output.txt"

# Đọc file
with open(input_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Loại bỏ dòng trùng nhưng vẫn giữ nguyên thứ tự
unique_lines = list(dict.fromkeys(lines))

# Ghi lại file
with open(output_file, "w", encoding="utf-8") as f:
    f.writelines(unique_lines)

print(f"Đã xử lý {len(lines)} dòng")
print(f"Còn lại {len(unique_lines)} dòng")