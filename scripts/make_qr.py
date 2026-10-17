"""QR コード画像を qr/ に作る。読み取ると級を選ぶ画面が開く。
使い方: python3 scripts/make_qr.py https://<ユーザー名>.github.io/subaru-quiz/
"""
import sys
from pathlib import Path

import qrcode

OUT_DIR = Path(__file__).resolve().parent.parent / "qr"


def main(base_url):
    base_url = base_url.rstrip("/") + "/"
    OUT_DIR.mkdir(exist_ok=True)
    qrcode.make(base_url).save(OUT_DIR / "quiz.png")
    print(base_url)


if __name__ == "__main__":
    main(sys.argv[1])
