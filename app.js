const QUESTION_COUNT = 3;
// 級ごとの難しさ（キラキラ星の数、最大6つ）
const STARS = { "3": 1, "2": 3, "1": 6 };
const MAX_STARS = 6;
// 4方向にとがった金色の星（背景が暗いので画像ではなく SVG で描く）
const STAR_SVG = `<svg class="star" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 2 C54 34 66 46 98 50 C66 54 54 66 50 98 C46 66 34 54 2 50 C34 46 46 34 50 2 Z"/></svg>`;
const starHtml = lv => `<span class="stars" role="img" aria-label="難しさ 星${STARS[lv]}つ">${STAR_SVG.repeat(STARS[lv])}<span class="off">${STAR_SVG.repeat(MAX_STARS - STARS[lv])}</span></span>`;
// 画面に出すクラス名（Excel の級との対応）
const CLASS_NAMES = { "3": "ストリート級", "2": "スポーツ級", "1": "WRC級" };
// 結果画面に出す景品交換の案内（場所などが決まったらここを書き換える）
const PRIZE_TITLE = "景品と交換できます";
const PRIZE_TEXT = "この画面をスタッフにお見せください。";
const screen = document.getElementById("screen");
const level = new URLSearchParams(location.search).get("level");

let pool = [];
let quiz = [];
let current = 0;
let score = 0;

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// 1文字ずつ span に分けて、CSS でずらして動かす
function kinetic(text) {
  const chars = [...String(text)].map((c, i) =>
    `<span class="ch" style="--i:${i};--r:${(i % 2 ? 1 : -1) * (10 + (i * 7) % 20)}">${c === " " ? "&nbsp;" : escapeHtml(c)}</span>`
  ).join("");
  return `<span role="text" aria-label="${escapeHtml(text)}"><span aria-hidden="true">${chars}</span></span>`;
}

function start() {
  quiz = shuffle(pool).slice(0, QUESTION_COUNT);
  current = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  const q = quiz[current];
  screen.innerHTML = `
    <div class="card">
      <p class="progress"><span class="num">${String(current + 1).padStart(2, "0")}</span><span class="of">/ ${String(quiz.length).padStart(2, "0")}</span></p>
      <div class="category">${escapeHtml(q.category)}</div>
      <p class="question kinetic">${kinetic(q.question)}</p>
      <div class="choices">
        ${q.choices.map((c, i) => `<button class="choice" style="--i:${i}" data-i="${i}"><span class="key">${"ABCD"[i]}</span>${escapeHtml(c)}</button>`).join("")}
      </div>
      <div id="feedback"></div>
    </div>`;
  screen.querySelectorAll(".choice").forEach(b => b.addEventListener("click", () => answer(Number(b.dataset.i))));
}

function answer(picked) {
  const q = quiz[current];
  const ok = picked === q.answer;
  if (ok) score++;
  screen.querySelector(".choices").classList.add("answered");
  screen.querySelectorAll(".choice").forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add("correct");
    else if (i === picked) b.classList.add("wrong");
  });
  const last = current === quiz.length - 1;
  document.getElementById("feedback").innerHTML = `
    <p class="verdict ${ok ? "ok" : "ng"}">${kinetic(ok ? "正解！" : "残念…")}</p>
    <p class="explanation">${escapeHtml(q.explanation)}</p>
    <button class="primary" id="next">${last ? "結果を見る" : "次の問題へ"}</button>`;
  document.getElementById("next").addEventListener("click", () => {
    if (last) showResult();
    else { current++; showQuestion(); }
  });
}

function showResult() {
  const messages = ["また挑戦してね", "あと一歩！", "なかなかのスバリスト", "完璧！真のスバリスト"];
  screen.innerHTML = `
    <div class="card">
      <p class="score-label">SCORE</p>
      <p class="score"><span class="big">${score}</span><span class="total"> / ${quiz.length}</span></p>
      <p class="message kinetic">${kinetic(messages[Math.round(score / quiz.length * 3)])}</p>
      <div class="prize">
        <p class="prize-label">PRESENT</p>
        <p class="prize-title kinetic">${kinetic(PRIZE_TITLE)}</p>
        <p class="prize-text">${escapeHtml(PRIZE_TEXT)}</p>
        <p class="prize-time">${new Date().toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} 挑戦</p>
      </div>
    </div>`;
}

function showLevelSelect() {
  document.getElementById("level-label").textContent = "SELECT CLASS";
  screen.innerHTML = `
    <p class="select-lead">挑戦するクラスを選んでください</p>
    <div class="levels">
      ${["3", "2", "1"].map((lv, i) => `<a class="level-btn" style="--i:${i}" href="?level=${lv}"><span class="lv">${CLASS_NAMES[lv]}</span>${starHtml(lv)}</a>`).join("")}
    </div>`;
}

const title = document.getElementById("title");
title.innerHTML = kinetic(title.textContent);

fetch("questions.json", { cache: "no-cache" })
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(all => {
    // 級の指定がないときは、クラスを選ぶ画面を出す（級をまたいで出題しない）
    if (!["1", "2", "3"].includes(level)) {
      showLevelSelect();
      return;
    }
    pool = all.filter(q => q.level === level);
    document.getElementById("level-label").innerHTML = `${CLASS_NAMES[level]} ${starHtml(level)}`;
    if (pool.length === 0) {
      screen.innerHTML = `<div class="card">このクラスの問題がありません。</div>`;
      return;
    }
    start();
  })
  .catch(() => { screen.innerHTML = `<div class="card">問題を読み込めませんでした。</div>`; });
