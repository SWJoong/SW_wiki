# 병렬 하네스 계획서 — SW_wiki

> 소유: **W**(설계·검증). U가 부트스트랩했고, 이후 유지·개정은 W가 담당한다.
> 운영 원리·세션 루틴의 상세는 `parallel-agent-harness` 스킬의 operating-model 참조.

두 Claude Code 세션을 한 저장소에서 **충돌·재작업·토큰 낭비 없이** 굴리기 위한 하네스.
핵심은 속도가 아니라 **자기 채점 방지** — 저작하는 손(U)과 검증하는 손(W)을 분리한다.

## 4가지 결정 (확정)

### ① 축·역할
| 역할 | 환경 | 축 | 하는 일 |
|---|---|---|---|
| **W** | Windows / thinkpad | 설계·검증 | 온톨로지(개념) 설계 · 팩트체크 · publish 게이트 · MOC 정합·링크 무결성 |
| **U** | Ubuntu 허브 (24/7) | 저작·구현·배포 | 자료수집 · 논문 초안 · Quartz/CI/스크립트 인프라 · 그래프 |

기존 편집 게이트와 그대로 맞물린다: **U가 쓴 초안(`ai-generated`) → W가 검증 → `reviewed`+`publish:true`.**

### ② 레인 (겹치지 않는 디렉터리)
- **W 레인**: `content/concepts/` · `content/mocs/` · `content/index.md`
- **U 레인**: `content/papers/` · `content/inbox/`(로컬·gitignore) · `content/그래프.md` ·
  `quartz.config.yaml` · `quartz/` · `.github/` · `scripts/` · `package.json` · `~/knowledge/bin`(로컬)
- **공유 소유**: 하네스 문서(`CLAUDE.md` 하네스 섹션·`HARNESS.md`)=W / 런타임 인프라(`agent-sync.sh`·`.claude/`·훅·`.gitignore`)=U

> 개념(concepts)은 지식의 **온톨로지=설계**라 W가 소유한다. 논문(papers)은 **자료수집·초안**이라 U가 소유한다.
> 이 경계가 자주 겹치면 노트 구조 신호 — 개념/논문 분리를 다시 본다.

### ③ 동기화 채널
- git orphan 브랜치 **`agent-sync`** + `scripts/agent-sync.sh` (roles = `w u`).
- `pull`=상대 상태 로드(SessionStart 훅 자동), `post <w|u> "..."`=내 상태 기록. 상태만, 코드는 PR·CI.

### ④ 게이트·핸드오프
- **게이트**: `npx quartz build` 성공(로컬, 최초 `npm ci`) · PR의 Actions 빌드(CI). 링크 무결성은 W가 test-first로 못 박는다.
- **`v5` 직접 push 금지** → feature 브랜치 + PR → Actions 통과 + W 검토 → 병합(=배포).
- **핸드오프 접두**: `[HANDOFF→W]` · `[HANDOFF→U]` · `[SYNC]`.

## 상태 이원화 (한 줄)
**코드=PR·CI · 대화=agent-sync 채널 · 상황=커밋 메시지 접두.**

## 첫 사이클 제안
1. U: `content/inbox/` 신설(gitignore) + `papers/` 초안 파이프라인 → `[HANDOFF→W]`.
2. W: 초안 팩트체크 + 개념 연결 검증 + 깨진 링크/고아 노트 목록(test-first) → `[HANDOFF→U]`.
3. U: 목록 초록화(링크·출처·노트) → PR → W 리뷰 → v5 병합 → 자동 배포.
