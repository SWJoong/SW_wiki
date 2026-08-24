# SW_wiki — 사회복지 개인예산제 위키 (Claude Code 지침)

장애인 복지(개인예산제) 학술 지식베이스. 스택: Zotero → Obsidian → Quartz → Claude Code.
- 소스/Vault = 이 저장소(**Quartz v5**). 콘텐츠는 `content/`. 배포는 `.github/workflows/deploy.yml`이
  **`v5` push마다** GitHub Actions에서 build→Pages(`SWJoong.github.io/SW_wiki`) 수행. **로컬/허브는 빌드하지 않는다.**
- 편집 게이트: `status: ai-generated|stub`(비공개) → 검증 → `status: reviewed` + `publish: true`(발행).
  LLM 초안은 비공개, **사람/W가 검증한 노트만 발행**한다.

---

## 병렬 하네스 운영 중
이 프로젝트는 2개의 Claude Code 인스턴스가 병렬로 작업한다. 목적은 속도가 아니라
**자기 결과를 자기가 채점하지 않게 하는 것** — 저작하는 손과 검증하는 손을 분리한다.
- **W** (Windows/thinkpad): **설계·검증 축** — 온톨로지(개념) 설계 · 팩트체크 · publish 게이트 · MOC 정합.
- **U** (Ubuntu 허브): **저작·구현·배포 축** — 자료수집 · 논문 초안 · 인프라(Quartz·CI·스크립트).

### 레인 규칙 (충돌 방지의 핵심 — 자기 레인만 연다)
- `content/concepts/` · `content/mocs/` · `content/index.md` 수정 → **W만**
- `content/papers/` · `content/inbox/`(로컬·gitignore) · `content/그래프.md` ·
  `quartz.config.yaml` · `quartz/` · `.github/` · `scripts/`(agent-sync 제외) · `package.json` 수정 → **U만**
- 공유 파일 소유:
  - `CLAUDE.md`「병렬 하네스」섹션 · `HARNESS.md` → **W 소유**(U는 리뷰)
  - `scripts/agent-sync.sh` · `.claude/settings.json` · 훅 · `.gitignore` → **U 소유**(W는 리뷰)
- **`v5` 직접 push 금지** — 콘텐츠/코드는 **항상 feature 브랜치 + PR·CI 경유**.
  (`v5` push = 즉시 배포이므로 W 검토 후 병합한다.)

### 상태 동기화 (복붙 없이 — agent-sync 채널)
- 세션 시작·재개 시: `scripts/agent-sync.sh pull` (SessionStart 훅이 자동 수행).
- 핸드오프·턴 종료 시: `scripts/agent-sync.sh post <w|u> "진행상황·문제·다음 요청"`.
- 전용 `agent-sync` 브랜치에 **상태 로그만** 담는다(코드 아님). 코드 핸드오프는 PR·CI.

### 핸드오프·커밋 컨벤션
- 인계 커밋 접두: `[HANDOFF→W]` · `[HANDOFF→U]` · `[SYNC]`
- 예: `[HANDOFF→W] park2025 논문 초안 작성, 팩트체크·개념 연결 요청`

### 매 세션 루틴 (토큰 절약)
1. `scripts/agent-sync.sh pull` — 상대 최신 상태 로드(훅 자동). 이전 결과 복붙 재설명 금지.
2. 아래 「현재 작업 현황」 + 채널 로그로 **내 다음 작업만** 파악.
3. 게이트만 확인 — 전체 재검토 대신: `npx quartz build` 성공(로컬, 최초 1회 `npm ci`) 또는 PR의 Actions 빌드.
4. **내 레인만** 착수. 턴 종료 시 `post`로 상태만 남긴다.
> 상태 이원화: 코드=PR·CI · 대화=agent-sync(복붙 0) · 상황=커밋 메시지 접두.

### test-first (콘텐츠판)
W가 **실패하는 검증**을 먼저 박는다 — 깨진 위키링크 · 미검증 사실(`needs_source_check`) · 고아 노트 목록.
U가 그 목록을 초록으로 만든다(링크 연결 · 출처 보강 · 노트 작성).

### 충돌 해결 우선순위
1. 충돌이 `content/concepts/`·`mocs/`·`index.md` → **W** 우선
2. 충돌이 U 레인 → **U** 우선
3. 공유 파일 → 담당(위 소유 규칙) 우선
4. 판단 불가 → 사용자가 수동 해결

### 현재 작업 현황
<!-- 양쪽이 작업 시작/완료 시 이 섹션을 갱신·push 한다 -->
- 활성(U): 허브 인프라 구축(클론·zk 스크립트·systemd) 완료 · 하네스 설치
- 활성(W): (대기 — 첫 세션 시 pull 후 이 줄 갱신)
- 다음: U → papers 초안 파이프라인 / W → concepts 온톨로지 검증 · MOC 확장

---

## 하네스 역할: W = 설계·검증 (Windows/thinkpad)
- 담당(내 레인): `content/concepts/` · `content/mocs/` · `content/index.md` · 팩트체크 · publish 게이트 · 링크/사실 검증
- 금지: U 레인 직접 수정 · `v5` 직접 push
- 작업 패턴: `pull` → 검증(깨진 링크·미검증 사실 목록화, test-first) → `[HANDOFF→U]`로 보강 요청 / U의 PR 리뷰·승인

## 하네스 역할: U = 저작·구현·배포 (Ubuntu 허브)
- 담당(내 레인): `content/papers/` · `content/inbox/`(로컬) · `content/그래프.md` ·
  `quartz.config.yaml` · `quartz/` · `.github/` · `scripts/` · `package.json` · `~/knowledge/bin`(로컬 인프라)
- 금지: `content/concepts/`·`mocs/`·`index.md` 직접 수정(W 영역) · 온톨로지 단독 변경(W에 요청) · `v5` 직접 push
- 작업 패턴: feature 브랜치 → 초안·구현 → push → `[HANDOFF→W]`로 검증 요청
