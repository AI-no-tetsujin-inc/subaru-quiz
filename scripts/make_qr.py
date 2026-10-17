"""級別の QR コード画像を qr/ に作る。
使い方: python3 scripts/make_qr.py https://<ユーザー名>.github.io/subaru-quiz/
"""
import sys
from pathlib import Path

import qrcode

OUT_DIR = Path(__file__).resolve().parent.parent / "qr"


def main(base_url):
    base_url = base_url.rstrip("/") + "/"
    OUT_DIR.mkdir(exist_ok=True)
    for level in ("3", "2", "1"):
        url = f"{base_url}?level={level}"
        qrcode.make(url).save(OUT_DIR / f"level{level}.png")
        print(f"{level}級: {url}")


if __name__ == "__main__":
    main(sys.argv[1])
