"""Excel の問題一覧を questions.json に変換する。
使い方: python3 scripts/build_questions.py <Excelファイル>
"""
import json
import sys
from pathlib import Path

import openpyxl

OUT = Path(__file__).resolve().parent.parent / "questions.json"


def main(xlsx):
    ws = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)["問題一覧"]
    questions = []
    for row in ws.iter_rows(min_row=4, values_only=True):
        no, level, category, qtype, text, a, b, c, d, answer, explanation = row[:11]
        if not text or not answer:
            continue
        if qtype == "○×":
            choices = ["○", "×"]
            answer_index = 0 if str(answer).strip() in ("○", "A") else 1
        else:
            choices = [str(x) for x in (a, b, c, d) if x not in (None, "")]
            key = str(answer).strip()
            if key not in "ABCD"[:len(choices)]:
                sys.exit(f"No.{no}: 正解「{key}」が選択肢と合いません")
            answer_index = "ABCD".index(key)
        questions.append({
            "no": no,
            "level": str(level or "").replace("級", ""),
            "category": category or "",
            "question": str(text),
            "choices": choices,
            "answer": answer_index,
            "explanation": explanation or "",
        })
    OUT.write_text(json.dumps(questions, ensure_ascii=False, indent=1), encoding="utf-8")
    counts = {}
    for q in questions:
        counts[q["level"]] = counts.get(q["level"], 0) + 1
    print(f"{len(questions)}問を出力: {counts}")


if __name__ == "__main__":
    main(sys.argv[1])
