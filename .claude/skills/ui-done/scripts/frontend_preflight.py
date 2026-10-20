#!/usr/bin/env python3
"""Static frontend preflight for portability, assets, tiny text, and secrets.

This is intentionally dependency-free and cross-platform. It supplements real
browser testing; it cannot prove computed layout, font loading, or interaction.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
from dataclasses import asdict, dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.parse import unquote, urlsplit


TEXT_EXTENSIONS = {
    ".html",
    ".htm",
    ".css",
    ".js",
    ".mjs",
    ".cjs",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
}
SKIP_DIRECTORIES = {
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    ".cache",
    ".parcel-cache",
    "coverage",
}
LOCKFILES = {
    "package-lock.json",
    "npm-shrinkwrap.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lock",
    "bun.lockb",
}
RUNTIME_LINK_RELS = {
    "stylesheet",
    "preload",
    "modulepreload",
    "icon",
    "manifest",
    "apple-touch-icon",
}


@dataclass(frozen=True)
class Finding:
    severity: str
    code: str
    file: str
    line: int
    message: str


@dataclass(frozen=True)
class ResourceRef:
    value: str
    line: int
    context: str


class RuntimeHTMLParser(HTMLParser):
    """Collect only HTML references that a browser may load at runtime."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.references: list[ResourceRef] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {name.lower(): value or "" for name, value in attrs}
        tag = tag.lower()
        line, _ = self.getpos()

        def add(attribute: str) -> None:
            value = values.get(attribute, "").strip()
            if value:
                self.references.append(ResourceRef(value, line, f"<{tag}> {attribute}"))

        if tag == "script":
            add("src")
        elif tag == "link":
            rels = {part.lower() for part in values.get("rel", "").split()}
            if rels & RUNTIME_LINK_RELS:
                add("href")
        elif tag in {"img", "audio", "video", "iframe", "embed", "track", "input"}:
            add("src")
            if tag == "video":
                add("poster")
        elif tag == "source":
            add("src")
            srcset = values.get("srcset", "").strip()
            if srcset and not srcset.lower().startswith("data:"):
                for candidate in srcset.split(","):
                    url = candidate.strip().split(maxsplit=1)[0]
                    if url:
                        self.references.append(ResourceRef(url, line, "<source> srcset"))
        elif tag == "object":
            add("data")
        elif tag == "use":
            add("href")
            add("xlink:href")


CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)([^'\")]+)\1\s*\)", re.IGNORECASE)
CSS_IMPORT_RE = re.compile(
    r"@import\s+(?:url\(\s*)?(['\"])([^'\"]+)\1\s*\)?",
    re.IGNORECASE,
)
CSS_FONT_SIZE_RE = re.compile(r"font-size\s*:\s*(-?\d+(?:\.\d+)?)px\b", re.IGNORECASE)
TAILWIND_FONT_SIZE_RE = re.compile(r"\btext-\[(\d+(?:\.\d+)?)px\]")
JS_RUNTIME_RE = re.compile(
    r"(?:fetch|import|new\s+Worker|new\s+SharedWorker)\s*\(\s*(['\"])([^'\"]+)\1",
    re.IGNORECASE,
)
JS_STATIC_IMPORT_RE = re.compile(
    r"(?:\bfrom\s+|\bimport\s*)(['\"])((?:https?:)?//[^'\"]+|/[^'\"]+)\1",
    re.IGNORECASE,
)
SECRET_PATTERNS = {
    "PRIVATE_KEY": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "OPENAI_STYLE_TOKEN": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "GITHUB_TOKEN": re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"),
    "AWS_ACCESS_KEY": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
}


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def mask_script_bodies(html: str) -> str:
    """Hide inline JavaScript while preserving offsets for CSS-like scans."""

    def replace(match: re.Match[str]) -> str:
        body = match.group(2)
        masked = re.sub(r"[^\r\n]", " ", body)
        return f"{match.group(1)}{masked}{match.group(3)}"

    return re.sub(
        r"(<script\b[^>]*>)([\s\S]*?)(</script\s*>)",
        replace,
        html,
        flags=re.IGNORECASE,
    )


def is_remote(value: str) -> bool:
    return bool(re.match(r"^(?:https?:)?//", value.strip(), re.IGNORECASE))


def is_root_relative(value: str) -> bool:
    value = value.strip()
    return value.startswith("/") and not value.startswith("//")


def is_ignored_reference(value: str) -> bool:
    lowered = value.strip().lower()
    return (
        not lowered
        or lowered.startswith(("#", "data:", "blob:", "mailto:", "tel:", "javascript:"))
        or "{{" in lowered
        or "${" in lowered
        or lowered.startswith("var(")
    )


def local_reference_path(source: Path, value: str) -> Path | None:
    if is_ignored_reference(value) or is_remote(value) or is_root_relative(value):
        return None
    parsed = urlsplit(value)
    if parsed.scheme or not parsed.path:
        return None
    decoded = unquote(parsed.path)
    return (source.parent / Path(decoded)).resolve()


def iter_files(target: Path) -> Iterable[Path]:
    if target.is_file():
        if target.suffix.lower() in TEXT_EXTENSIONS:
            yield target
        return
    for path in target.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        try:
            relative_parts = path.relative_to(target).parts[:-1]
        except ValueError:
            relative_parts = path.parts[:-1]
        if any(part in SKIP_DIRECTORIES for part in relative_parts):
            continue
        yield path


def finding_for_reference(
    source: Path,
    ref: ResourceRef,
    offline: bool,
    root: Path,
) -> list[Finding]:
    value = ref.value.strip()
    if is_ignored_reference(value):
        return []
    display_file = str(source.relative_to(root)) if source.is_relative_to(root) else str(source)
    findings: list[Finding] = []
    if is_remote(value):
        findings.append(
            Finding(
                "error" if offline else "warning",
                "REMOTE_RUNTIME_RESOURCE",
                display_file,
                ref.line,
                f"{ref.context} loads a remote runtime resource; package it locally or document the requirement.",
            )
        )
        return findings
    if is_root_relative(value):
        if offline:
            findings.append(
                Finding(
                    "error",
                    "ROOT_RELATIVE_RESOURCE",
                    display_file,
                    ref.line,
                    f"{ref.context} uses a root-relative path that normally fails under file://.",
                )
            )
        return findings
    local_path = local_reference_path(source, value)
    if local_path is not None and not local_path.exists():
        findings.append(
            Finding(
                "error" if offline else "warning",
                "MISSING_LOCAL_ASSET",
                display_file,
                ref.line,
                f"{ref.context} points to a missing local asset: {urlsplit(value).path}",
            )
        )
    return findings


def scan_text_file(source: Path, text: str, root: Path, offline: bool, min_font_px: float) -> list[Finding]:
    display_file = str(source.relative_to(root)) if source.is_relative_to(root) else str(source)
    findings: list[Finding] = []
    suffix = source.suffix.lower()

    if suffix in {".html", ".htm"}:
        parser = RuntimeHTMLParser()
        try:
            parser.feed(text)
        except Exception as exc:  # HTMLParser is forgiving, but report unexpected parser failures.
            findings.append(Finding("warning", "HTML_PARSE", display_file, 1, f"Could not fully parse HTML: {exc}"))
        for ref in parser.references:
            findings.extend(finding_for_reference(source, ref, offline, root))

    # CSS syntax inside an arbitrary JavaScript bundle is not distinguishable
    # from ordinary calls such as url(value) without parsing the language.
    # Restrict this scan to stylesheets and HTML (with script bodies masked) so
    # minified application code does not produce fake missing-asset findings.
    if suffix in {".css", ".html", ".htm"}:
        css_search_text = mask_script_bodies(text) if suffix in {".html", ".htm"} else text
        for regex, context in ((CSS_URL_RE, "CSS url()"), (CSS_IMPORT_RE, "CSS @import")):
            for match in regex.finditer(css_search_text):
                value = match.group(2).strip()
                ref = ResourceRef(value, line_number(css_search_text, match.start()), context)
                findings.extend(finding_for_reference(source, ref, offline, root))

        for match in CSS_FONT_SIZE_RE.finditer(css_search_text):
            size = float(match.group(1))
            if 0 < size < min_font_px:
                findings.append(
                    Finding(
                        "warning",
                        "SMALL_TEXT",
                        display_file,
                        line_number(css_search_text, match.start()),
                        f"Literal font-size {size:g}px is below the configured {min_font_px:g}px floor; verify its semantic role and computed size.",
                    )
                )
        for match in TAILWIND_FONT_SIZE_RE.finditer(css_search_text):
            size = float(match.group(1))
            if 0 < size < min_font_px:
                findings.append(
                    Finding(
                        "warning",
                        "SMALL_TEXT",
                        display_file,
                        line_number(css_search_text, match.start()),
                        f"Tailwind arbitrary text size {size:g}px is below the configured {min_font_px:g}px floor.",
                    )
                )

    if suffix in {".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".html", ".htm"}:
        for regex in (JS_RUNTIME_RE, JS_STATIC_IMPORT_RE):
            for match in regex.finditer(text):
                value = match.group(2).strip()
                if not (is_remote(value) or is_root_relative(value)):
                    continue
                findings.extend(
                    finding_for_reference(
                        source,
                        ResourceRef(value, line_number(text, match.start()), "JavaScript runtime reference"),
                        offline,
                        root,
                    )
                )

    for name, pattern in SECRET_PATTERNS.items():
        for match in pattern.finditer(text):
            findings.append(
                Finding(
                    "error",
                    "POSSIBLE_SECRET",
                    display_file,
                    line_number(text, match.start()),
                    f"Possible {name.lower().replace('_', ' ')} embedded in client-readable text; the value is intentionally not printed.",
                )
            )
    return findings


def has_lockfile(package_dir: Path, root: Path) -> bool:
    current = package_dir
    while True:
        if any((current / name).exists() for name in LOCKFILES):
            return True
        if current == root or current.parent == current:
            return False
        current = current.parent


def package_findings(package_files: list[Path], root: Path) -> list[Finding]:
    findings: list[Finding] = []
    for package_file in package_files:
        display_file = str(package_file.relative_to(root)) if package_file.is_relative_to(root) else str(package_file)
        try:
            payload = json.loads(package_file.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            findings.append(Finding("error", "PACKAGE_JSON", display_file, 1, f"Cannot parse package manifest: {exc}"))
            continue
        dependency_count = sum(
            len(payload.get(field, {}) or {})
            for field in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies")
        )
        if dependency_count and not has_lockfile(package_file.parent, root):
            findings.append(
                Finding(
                    "warning",
                    "LOCKFILE_MISSING",
                    display_file,
                    1,
                    "Package dependencies are declared but no lockfile was found at this package or an ancestor within the target.",
                )
            )
    return findings


def audit(target: Path, offline: bool, min_font_px: float, max_file_mb: float) -> tuple[list[Finding], int]:
    target = target.resolve()
    root = target if target.is_dir() else target.parent
    findings: list[Finding] = []
    scanned = 0
    package_files: list[Path] = []
    max_bytes = int(max_file_mb * 1024 * 1024)

    for source in iter_files(target):
        if source.name == "package.json":
            package_files.append(source)
        try:
            size = source.stat().st_size
        except OSError as exc:
            findings.append(Finding("warning", "FILE_STAT", str(source), 1, f"Cannot inspect file: {exc}"))
            continue
        display_file = str(source.relative_to(root)) if source.is_relative_to(root) else str(source)
        if size > max_bytes:
            findings.append(
                Finding(
                    "note",
                    "FILE_SKIPPED",
                    display_file,
                    1,
                    f"Skipped {size / (1024 * 1024):.1f} MiB text file above --max-file-mb={max_file_mb:g}.",
                )
            )
            continue
        try:
            text = source.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            findings.append(Finding("warning", "FILE_READ", display_file, 1, f"Cannot read file: {exc}"))
            continue
        scanned += 1
        findings.extend(scan_text_file(source, text, root, offline, min_font_px))

    findings.extend(package_findings(package_files, root))
    unique = {(
        item.severity,
        item.code,
        item.file,
        item.line,
        item.message,
    ): item for item in findings}
    ordered = sorted(unique.values(), key=lambda item: (item.file.lower(), item.line, item.severity, item.code))
    return ordered, scanned


def run_self_test() -> None:
    with tempfile.TemporaryDirectory(prefix="frontend-preflight-") as temp:
        root = Path(temp)
        fixture_secret = "sk-" + "1234567890abcdefghijklmnop"
        (root / "index.html").write_text(
            f"""<!doctype html>
<style>.tiny {{ font-size: 10px; background: url('./missing-bg.png'); }}</style>
<script src="https://cdn.example.invalid/app.js"></script>
<img src="./missing.png" alt="fixture">
<script>window.fixture = "{fixture_secret}";</script>
""",
            encoding="utf-8",
        )
        (root / "app.js").write_text(
            "function url(value) { return value; } url('not-a-css-asset.png');",
            encoding="utf-8",
        )
        findings, scanned = audit(root, offline=True, min_font_px=11, max_file_mb=1)
        codes = {item.code for item in findings}
        expected = {"REMOTE_RUNTIME_RESOURCE", "MISSING_LOCAL_ASSET", "SMALL_TEXT", "POSSIBLE_SECRET"}
        missing = expected - codes
        javascript_css_false_positive = any(
            item.file == "app.js" and item.code == "MISSING_LOCAL_ASSET" for item in findings
        )
        if scanned != 2 or missing or javascript_css_false_positive:
            raise AssertionError(
                "Self-test failed; "
                f"scanned={scanned}, missing={sorted(missing)}, "
                f"javascript_css_false_positive={javascript_css_false_positive}"
            )
    print("Self-test passed: remote resources, missing assets, small text, and secrets were detected.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scan frontend source or built output for offline resources, missing assets, tiny literal text, lockfiles, and likely embedded secrets.",
        epilog="This static scan supplements real-browser screenshots, computed styles, network logs, and interaction tests.",
    )
    parser.add_argument("target", nargs="?", help="Frontend project, built-output directory, or individual text file.")
    parser.add_argument("--offline", action="store_true", help="Treat remote and root-relative runtime resources as errors.")
    parser.add_argument("--min-font-px", type=float, default=11.0, help="Warn on literal px font sizes below this value (default: 11).")
    parser.add_argument("--max-file-mb", type=float, default=12.0, help="Skip individual text files larger than this many MiB (default: 12).")
    parser.add_argument("--format", choices=("text", "json"), default="text", help="Output format (default: text).")
    parser.add_argument(
        "--fail-on",
        choices=("error", "warning", "never"),
        default="error",
        help="Exit nonzero on errors, warnings+errors, or never (default: error).",
    )
    parser.add_argument("--self-test", action="store_true", help="Run the built-in cross-platform fixture test and exit.")
    args = parser.parse_args()
    if not args.self_test and not args.target:
        parser.error("target is required unless --self-test is used")
    if args.min_font_px <= 0 or args.max_file_mb <= 0:
        parser.error("--min-font-px and --max-file-mb must be positive")
    return args


def main() -> int:
    args = parse_args()
    if args.self_test:
        run_self_test()
        return 0

    target = Path(args.target).expanduser()
    if not target.exists():
        print(f"Target does not exist: {target}", file=sys.stderr)
        return 2

    findings, scanned = audit(target, args.offline, args.min_font_px, args.max_file_mb)
    counts = {severity: sum(item.severity == severity for item in findings) for severity in ("error", "warning", "note")}

    if args.format == "json":
        print(
            json.dumps(
                {
                    "target": str(target.resolve()),
                    "offline": args.offline,
                    "scanned_files": scanned,
                    "counts": counts,
                    "findings": [asdict(item) for item in findings],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        for item in findings:
            print(f"{item.severity.upper():7} {item.code:24} {item.file}:{item.line}  {item.message}")
        print(
            f"Scanned {scanned} file(s). "
            f"Errors: {counts['error']}; warnings: {counts['warning']}; notes: {counts['note']}."
        )
        if not findings:
            print("Static preflight passed with no findings. Run real-browser QA before acceptance.")

    if args.fail_on == "never":
        return 0
    if counts["error"]:
        return 1
    if args.fail_on == "warning" and counts["warning"]:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
