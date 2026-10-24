#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
字体子集化：只保留站内真正用到的字符。

为什么做：Noto Sans SC 的中文分片含 7333 个汉字，而站内实际只用 723 个。
子集化后体积可以降一个数量级。

授权：三款字体均为 SIL OFL 1.1，明确允许 modify（子集化属于修改）与嵌入，
且版权声明后未声明 Reserved Font Name，因此可以保留原名。
许可证原文见 public/fonts/OFL.txt。

用法：python scripts/subset-fonts.py
输出：public/fonts/*.woff2  +  public/fonts/fonts.css
"""

import os
import sys
import subprocess
from pathlib import Path

# Windows 控制台默认 GBK，打印 ✓/✗ 会抛 UnicodeEncodeError。
# 强制用 UTF-8 输出，避免脚本因为「打印失败」而中断。
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
NODE_MODULES = ROOT / "node_modules"
OUT_DIR = ROOT / "public" / "fonts"
CHARS_FILE = ROOT / "scripts" / ".chars.txt"

# (源文件, 输出名, 字重说明)
FONTS = [
    (
        "@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff",
        "noto-sans-sc-400.woff2",
        "Noto Sans SC",
        400,
    ),
    (
        "@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-500-normal.woff",
        "noto-sans-sc-500.woff2",
        "Noto Sans SC",
        500,
    ),
    (
        "@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff",
        "noto-sans-sc-700.woff2",
        "Noto Sans SC",
        700,
    ),
    (
        "@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-800-normal.woff",
        "noto-sans-sc-800.woff2",
        "Noto Sans SC",
        800,
    ),
    (
        "@fontsource/zcool-kuaile/files/zcool-kuaile-chinese-simplified-400-normal.woff",
        "zcool-kuaile-400.woff2",
        "ZCOOL KuaiLe",
        400,
    ),
    (
        "@fontsource-variable/baloo-2/files/baloo-2-latin-wght-normal.woff2",
        "baloo-2-latin.woff2",
        "Baloo 2",
        "400 800",
    ),
]


def main():
    if not CHARS_FILE.exists():
        print("缺少 scripts/.chars.txt，先运行：node scripts/collect-chars.mjs")
        return 1

    text = CHARS_FILE.read_text(encoding="utf-8")
    print(f"字符集：{len(text)} 个字符")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    total_before = 0
    total_after = 0

    for src_rel, out_name, family, weight in FONTS:
        src = NODE_MODULES / src_rel
        if not src.exists():
            print(f"  ✗ 源文件不存在：{src_rel}")
            continue

        out = OUT_DIR / out_name
        before = src.stat().st_size

        cmd = [
            sys.executable,
            "-m",
            "fontTools.subset",
            str(src),
            f"--text-file={CHARS_FILE}",
            f"--output-file={out}",
            "--flavor=woff2",
            "--layout-features=kern,liga",
            "--no-hinting",
            "--desubroutinize",
            "--drop-tables+=DSIG",
        ]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"  ✗ {out_name} 失败：{r.stderr[:200]}")
            continue

        after = out.stat().st_size
        total_before += before
        total_after += after
        print(
            f"  ✓ {out_name:28s} {before/1024:7.1f} KB -> {after/1024:6.1f} KB"
            f"  ({after/before*100:4.1f}%)"
        )

    if total_before:
        print(
            f"\n合计：{total_before/1024:.0f} KB -> {total_after/1024:.0f} KB "
            f"（省 {(1-total_after/total_before)*100:.1f}%）"
        )

    write_css()
    copy_license()
    return 0


def write_css():
    """生成 @font-face。注意 unicode-range 不再需要 —— 子集里全是会用到的字。"""
    css = """/*
 * 子集化字体 —— 由 scripts/subset-fonts.py 生成，不要手改。
 *
 * 只包含站内实际用到的字符（见 scripts/.chars.txt）。
 * 三款字体均为 SIL OFL 1.1 授权，允许免费商用、修改与嵌入：
 *   Baloo 2       Copyright 2019 The Baloo 2 Project Authors (EkType)
 *   ZCOOL KuaiLe  Copyright 2018 The ZCOOL KuaiLe Project Authors
 *   Noto Sans SC  Copyright Google Inc.
 * 完整许可证见 ./OFL.txt
 */

@font-face {
  font-family: 'Baloo 2';
  font-style: normal;
  font-weight: 400 800;
  font-display: swap;
  src: url('./baloo-2-latin.woff2') format('woff2');
}

@font-face {
  font-family: 'ZCOOL KuaiLe';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./zcool-kuaile-400.woff2') format('woff2');
}
"""
    for weight in (400, 500, 700, 800):
        css += f"""
@font-face {{
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: {weight};
  font-display: swap;
  src: url('./noto-sans-sc-{weight}.woff2') format('woff2');
}}
"""

    (OUT_DIR / "fonts.css").write_text(css, encoding="utf-8")
    print(f"\n已生成 {OUT_DIR / 'fonts.css'}")


def copy_license():
    """OFL 要求随分发附带许可证与版权声明。"""
    src = NODE_MODULES / "@fontsource" / "noto-sans-sc" / "LICENSE"
    if src.exists():
        header = (
            "本目录字体文件的许可证\n"
            "========================\n\n"
            "Baloo 2       Copyright 2019 The Baloo 2 Project Authors (https://github.com/EkType/Baloo2)\n"
            "ZCOOL KuaiLe  Copyright 2018 The ZCOOL KuaiLe Project Authors (https://github.com/googlefonts/zcool-kuaile)\n"
            "Noto Sans SC  Copyright Google Inc.\n\n"
            "三款字体均采用 SIL Open Font License 1.1，允许免费商用、修改与嵌入。\n"
            "以下是 OFL 1.1 许可证全文。\n\n"
            "----------------------------------------------------------------\n\n"
        )
        (OUT_DIR / "OFL.txt").write_text(header + src.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"已生成 {OUT_DIR / 'OFL.txt'}")


if __name__ == "__main__":
    sys.exit(main())
