#!/usr/bin/env node
// build-index.mjs — 빌드타임 정적 색인 생성기 (의존성 없음).
//
// 왜: Quartz는 Dataview를 렌더하지 않는다. 그래서 "자동 색인"은 빌드 전에
// 정적 마크다운으로 미리 박아 둬야 한다. 이 스크립트가 content/papers/ 를 읽어
// 연도별·정책단계별 목록과 "개념 → 논문" 역색인(커버리지 맵)을 만들어
// 대상 파일의 <!-- AUTO:INDEX:START --> ~ END 마커 사이를 갱신한다(멱등).
//
// 사용:
//   node scripts/build-index.mjs            # content/그래프.md 갱신 (기본, U 레인)
//   node scripts/build-index.mjs --check    # 갱신 없이 통계만 출력 (CI/미리보기)
//   node scripts/build-index.mjs --target content/mocs/MOC_개인예산제.md  # 다른 파일
//
// 규칙: publish:true 인 논문만 색인(비공개/초안 링크가 사이트에서 깨지지 않도록).
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PAPERS_DIR = join(ROOT, "content/papers");
const CONCEPTS_DIR = join(ROOT, "content/concepts");

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const ti = args.indexOf("--target");
const TARGET = join(ROOT, ti >= 0 ? args[ti + 1] : "content/그래프.md");

const START = "<!-- AUTO:INDEX:START -->";
const END = "<!-- AUTO:INDEX:END -->";

// ── 최소 프론트매터 파서 (이 저장소 스키마 전용: 단순 스칼라 + 인라인 배열) ──
function splitFrontmatter(raw) {
  if (!raw.startsWith("---")) return { fm: "", body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return { fm: "", body: raw };
  return { fm: raw.slice(3, end), body: raw.slice(end + 4) };
}
function unquote(s) {
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
    return s.slice(1, -1);
  return s;
}
function fmScalar(fm, key) {
  const m = fm.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"));
  return m ? unquote(m[1]) : "";
}
function fmArray(fm, key) {
  const m = fm.match(new RegExp(`^${key}:[ \\t]*\\[(.*)\\]`, "m"));
  if (!m) return [];
  return m[1]
    .split(",")
    .map((x) => unquote(x))
    .filter(Boolean);
}
// 본문 위키링크 추출 (alias 제거, 헤딩/블록 앵커 제거)
function wikilinks(body) {
  const out = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(body))) {
    let t = m[1].split("|")[0].split("#")[0].trim();
    if (t) out.push(t);
  }
  return out;
}

// ── 로드 ──
const conceptNames = new Set(
  existsSync(CONCEPTS_DIR)
    ? readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith(".md")).map((f) => basename(f, ".md"))
    : [],
);
const paperFiles = readdirSync(PAPERS_DIR).filter((f) => f.endsWith(".md"));
const paperKeys = new Set(paperFiles.map((f) => basename(f, ".md")));

const papers = [];
for (const f of paperFiles) {
  const key = basename(f, ".md");
  const { fm, body } = splitFrontmatter(readFileSync(join(PAPERS_DIR, f), "utf8"));
  if (fmScalar(fm, "publish") === "false") continue; // 발행 게이트 반영
  papers.push({
    key,
    title: fmScalar(fm, "title") || key,
    authors: fmScalar(fm, "authors"),
    year: parseInt(fmScalar(fm, "year"), 10) || 0,
    stages: fmArray(fm, "policy_stage"),
    links: wikilinks(body),
  });
}

// ── 집계 ──
const byYear = new Map();
const byStage = new Map();
const conceptToPapers = new Map();
const unresolved = new Map(); // 타깃 → [논문키]

for (const p of papers) {
  (byYear.get(p.year) ?? byYear.set(p.year, []).get(p.year)).push(p);
  for (const s of p.stages.length ? p.stages : ["(미지정)"])
    (byStage.get(s) ?? byStage.set(s, []).get(s)).push(p.key);
  for (const t of new Set(p.links)) {
    if (conceptNames.has(t))
      (conceptToPapers.get(t) ?? conceptToPapers.set(t, []).get(t)).push(p.key);
    else if (!paperKeys.has(t))
      (unresolved.get(t) ?? unresolved.set(t, []).get(t)).push(p.key);
  }
}
const orphanConcepts = [...conceptNames].filter((c) => !conceptToPapers.has(c)).sort((a, b) => a.localeCompare(b, "ko"));

// ── 렌더 ──
const ko = (a, b) => a.localeCompare(b, "ko");
const lines = [];
const P = (s = "") => lines.push(s);

P(START);
P("<!-- 이 블록은 scripts/build-index.mjs 가 생성합니다. 직접 수정 금지 — `npm run index` 로 갱신하세요. -->");
P(`> 자동 생성 색인 · 발행 논문 ${papers.length}편 · 개념 ${conceptNames.size}종`);
P();

P("## 논문 (연도순)");
for (const y of [...byYear.keys()].sort((a, b) => b - a)) {
  P(`### ${y || "연도 미상"}`);
  for (const p of byYear.get(y).sort((a, b) => ko(a.key, b.key)))
    P(`- [[${p.key}]] — ${p.title}${p.authors ? ` · ${p.authors}` : ""}`);
  P();
}

P("## 정책 단계별");
const STAGE_ORDER = [
  "담론 단계", "도입논쟁", "도입검토", "국내도입검토", "대선공약",
  "기초연구", "근거생성", "모델개발", "모의적용", "시범사업", "시범사업검토",
  "본사업준비", "본사업설계", "정책제언",
];
const stageRank = (s) => {
  const i = STAGE_ORDER.indexOf(s);
  return i < 0 ? STAGE_ORDER.length : i;
};
for (const s of [...byStage.keys()].sort((a, b) => stageRank(a) - stageRank(b) || ko(a, b))) {
  const ps = byStage.get(s).sort(ko);
  P(`- **${s}** (${ps.length}) — ${ps.map((k) => `[[${k}]]`).join(" · ")}`);
}
P();

P("## 개념 → 논문 색인 (커버리지 맵)");
P("각 개념을 인용·연결한 발행 논문. 사이드바 역링크의 전체 조감도이며, 논문이 적은 개념은 보강 후보다.");
P();
const conceptRows = [...conceptToPapers.entries()].sort(
  (a, b) => b[1].length - a[1].length || ko(a[0], b[0]),
);
for (const [c, ks] of conceptRows)
  P(`- [[${c}]] **(${ks.length})** — ${[...new Set(ks)].sort(ko).map((k) => `[[${k}]]`).join(" · ")}`);
P();

if (orphanConcepts.length) {
  P("### 미연결 개념 (논문 0편 — 보강 대상)");
  P(orphanConcepts.map((c) => `[[${c}]]`).join(" · "));
  P();
}
if (unresolved.size) {
  P("### 미해결 링크 (대상 파일 없음)");
  for (const [t, ks] of [...unresolved.entries()].sort(ko))
    P(`- \`[[${t}]]\` ← ${ks.map((k) => `[[${k}]]`).join(", ")}`);
  P();
}
P(END);

const block = lines.join("\n");

// ── 통계 출력 ──
console.log(`📊 발행 논문 ${papers.length}편 · 개념 ${conceptNames.size}종`);
console.log(`   개념 커버리지: ${conceptToPapers.size}/${conceptNames.size} 연결, 미연결 ${orphanConcepts.length}`);
console.log(`   미해결 링크: ${unresolved.size}`);
if (CHECK) {
  if (unresolved.size) {
    console.error("❌ 미해결 위키링크 존재:", [...unresolved.keys()].join(", "));
    process.exit(1);
  }
  console.log("✅ --check 통과 (미해결 링크 없음). 파일 미수정.");
  process.exit(0);
}

// ── 대상 파일 갱신 (마커 사이 치환, 없으면 말미에 추가) ──
if (!existsSync(TARGET)) {
  console.error(`❌ 대상 없음: ${TARGET}`);
  process.exit(1);
}
let doc = readFileSync(TARGET, "utf8");
const s = doc.indexOf(START);
const e = doc.indexOf(END);
if (s >= 0 && e > s) {
  doc = doc.slice(0, s) + block + doc.slice(e + END.length);
} else {
  doc = doc.replace(/\s*$/, "\n") + "\n" + block + "\n";
}
writeFileSync(TARGET, doc);
console.log(`✍️  갱신: ${TARGET.replace(ROOT, "")}`);
