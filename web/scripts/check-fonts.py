#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
验证子集字体覆盖了站内所有需要的字符。

为什么必须验：子集化最容易出的问题就是「漏字」——
某个汉字没进子集，页面上就显示成豆腐块（tofu）。
这个脚本把 .chars.txt 里的每个字符拿去对照字体的 cmap，
缺一个就报错，避免上线后才发现。
"""

import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
CHARS_FILE = ROOT / "scripts" / ".chars.txt"
FONT_DIR = ROOT / "public" / "fonts"

# 每个字体负责哪些字符
TARGETS = [
    ("noto-sans-sc-400.woff2", "Noto Sans SC", "han"),
    ("noto-sans-sc-500.woff2", "Noto Sans SC", "han"),
    ("noto-sans-sc-700.woff2", "Noto Sans SC", "han"),
    ("noto-sans-sc-800.woff2", "Noto Sans SC", "han"),
    ("zcool-kuaile-400.woff2", "ZCOOL KuaiLe", "han"),
    ("baloo-2-latin.woff2", "Baloo 2", "latin"),
]


def is_han(ch):
    cp = ord(ch)
    return 0x4E00 <= cp <= 0x9FFF or 0x3400 <= cp <= 0x4DBF


def is_latin(ch):
    return ch.isascii() and (ch.isalpha() or ch.isdigit())


def main():
    text = CHARS_FILE.read_text(encoding="utf-8")
    han = sorted({c for c in text if is_han(c)})
    latin = sorted({c for c in text if is_latin(c)})

    print(f"待校验：汉字 {len(han)} 个，拉丁字母/数字 {len(latin)} 个\n")

    failed = 0
    for name, family, kind in TARGETS:
        path = FONT_DIR / name
        if not path.exists():
            print(f"  ✗ {name} 不存在")
            failed += 1
            continue

        font = TTFont(path)
        cmap = font.getBestCmap()
        need = han if kind == "han" else latin
        missing = [c for c in need if ord(c) not in cmap]

        size_kb = path.stat().st_size / 1024
        if missing:
            failed += 1
            print(
                f"  ✗ {name:24s} {size_kb:6.1f} KB  缺 {len(missing)} 字：{''.join(missing[:20])}"
            )
        else:
            print(f"  ✓ {name:24s} {size_kb:6.1f} KB  覆盖 {len(need)} 字")

        font.close()

    if failed:
        print(f"\n✗ {failed} 个字体缺字，需重新生成子集")
        return 1

    total = sum((FONT_DIR / n).stat().st_size for n, _, _ in TARGETS)
    print(f"\n✓ 全部字体覆盖完整，合计 {total/1024:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
