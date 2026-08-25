## [2026-08-24T04:50Z] U
[설치] 하네스 부트스트랩 완료. 허브 인프라(클론 ~/knowledge/SW_wiki·zk 스크립트·systemd) + 채널 개설. 진행 중 PR: #3(.gitignore 정리), #4(하네스 설치=이 파일들, W 검토 요청). 다음(U): content/inbox/ 신설+papers 초안 파이프라인. 요청(W): PR#4 레인경계 검토·병합 후 concepts 온톨로지 검증 시작.

## [2026-08-24T09:15Z] U
[SYNC] 하네스 활성화됨 — PR #3(.gitignore)·#4(하네스) v5 병합 완료. 이제 리포 세션은 CLAUDE.md(레인·루틴) 자동 로드 + SessionStart 훅으로 agent-sync pull 자동. W측: Windows에서 SW_wiki 세션 열면 자동 pull됨. 다음(U): content/inbox 신설+papers 초안. 요청(W): concepts 온톨로지 검증·MOC 확장 착수 가능.

## [2026-08-24T09:23Z] U
[HANDOFF→W] papers 초안 파이프라인 PR #5 올림 — templates/paper.template.md(7섹션+확장필드 up/pdf/zotero) + inbox 로컬격리(.gitignore·ignorePatterns) + zk-new-paper 스캐폴드. 현황: papers 17편 전부 reviewed. 요청(W): PR#5의 up/related_concepts 규약이 온톨로지와 맞는지 검토·병합. 병합 후 U가 실제 논문 초안 착수 가능(원문/citation 주어지면).

## [2026-08-24T12:25Z] U
[SYNC] Phase 2 원격 세션 완료 — tmux3.4·RunSSH=true·Linger=yes. iPhone tailnet 연결됨(100.120.240.76). 허브 24/7 원격 진입로 개설. 파이프라인 PR#5 병합·배포 green. 다음: 모바일 ssh 종단 테스트 / 실제 논문 초안 착수 대기.

## [2026-08-24T12:51Z] U
모바일 원격접속 정리 (U 인프라) — 과정·결정 공유.

[과정] Phase 2 원격세션 구축: tmux 3.4 설치 · Tailscale RunSSH=true · linger=yes. KB용 Claude 세션 zk(피어명 sw-wiki-fc, tmux zk)가 허브에 24/7 상주. 모바일 접속 경로 3가지 검토: (1) SSH+tmux(Termius) (2) AnyDesk(원격데스크톱) (3) Claude Code 네이티브 원격제어.

[결정] 네이티브 원격제어를 '주력'으로 확정. 폰 Claude 앱에서 sw-wiki-fc 세션을 직접 열어 KB 질의 → 요구사항 ③(모바일 질의·세션유지·윈도우 전원 무관) 충족. SSH는 tailnet ACL 미완이라 보류(원격제어가 대체). AnyDesk(ID 866924764)는 GUI 전용 예비(Obsidian 그래프·시각편집)로 두고 평소 서비스 off — 보안 표면 최소화.

[W 영향] 없음(전부 U 레인 인프라). W도 Windows에서 SW_wiki 세션을 열면 CLAUDE.md·SessionStart 훅(agent-sync pull)·원격제어가 동일하게 로드됨.

[현재 상태] PR #3/#4/#5 병합·배포 green. 초안 파이프라인(templates·inbox·zk-new-paper) 라이브. papers 17편 전부 reviewed. 다음(U): 실제 논문 초안 착수 대기(원문/서지 필요). 요청(W): concepts 온톨로지 검증·MOC 확장 착수 가능.

## [2026-08-24T13:04Z] U
[HANDOFF→W] PR #6 — 빌드타임 정적 색인 생성기. Quartz가 Dataview 미렌더라 (자동) 색인을 빌드 전 정적 생성해야 함. scripts/build-index.mjs(의존성0)가 papers 프론트매터+위키링크→마커 사이 멱등 생성: ①논문 연도순 ②정책단계별(모의적용→시범→본사업 타임라인) ③개념→논문 커버리지 맵(역링크 조감도). 대상=content/그래프.md(U레인). npm run index / index:check(미해결 링크 CI검사, 현재 17편·29개념·커버리지 29/29·미해결0). 전부 U레인(scripts·package.json·그래프.md), W레인 무변경. 요청(W): 색인 축·표기 검토 + MOC(자동) 섹션에 마커 넣어 연동할지 결정(mocs/는 W소유라 편집은 W). ※로컬 quartz 빌드 미실행(허브 빌드안함)=권위빌드는 병합후 Actions.

## [2026-08-24T14:35Z] U
[검증] PR #6(정적 색인 생성기) 독립 sanity 검증 완료 — build-index.mjs --check 통과(발행17·개념29·커버리지29/29·미해결0). 리뷰: 의존성0·publish게이트 반영·멱등·CI --check 모드 양호. 변경파일 전부 U레인(그래프.md·package.json·scripts), MERGEABLE/CLEAN. (권위 검증은 W 몫). ⚠️경고: U 세션 2개가 동일 작업트리(~/knowledge/SW_wiki) 공유 중 — 이 세션 트리가 feat/static-index로 전환돼 있었음. 동시 커밋 충돌 위험 → git worktree 분리 또는 U 직렬화 필요. 판단 요청: 사용자.

## [2026-08-24T14:40Z] U
[HANDOFF→W] PR #7 — papers 17편에 원문연결 필드(zotero/pdf) 추가(설계 §1). citekey 뒤 'pdf:<key>'·'zotero://select/items/@<key>'. zotero 링크는 즉시 유용(원클릭 열기), pdf는 Phase4 대비. 전부 U레인(papers), 정적색인 PR#6과 무충돌·독립. 프론트매터 PyYAML 전수 검증 통과. ※격리: 이 세션은 git worktree(SW_wiki-u2/feat/paper-refs)에서 작업 → 메인 트리(다른 U의 feat/static-index) 불간섭. 요청(W): #6·#7 표기 검토·병합. 다음(U): 실제 논문 초안(원문/서지 필요).

## [2026-08-24T14:41Z] U
[HANDOFF→W] 하네스 규약 개정 제안 — '동일 머신 병렬 세션 = git worktree 필수'.

[배경/근거] 오늘 우분투에서 U 세션이 2개 이상 같은 작업트리(~/knowledge/SW_wiki)를 공유하다, 한 세션이 트리를 feat/static-index로 전환 → 다른 세션의 브랜치/커밋과 경합. 레인(디렉터리 소유) 분리만으로는 '같은 워킹트리의 git HEAD 경합'을 못 막는다는 게 실측됨.

[제안] HARNESS.md '②레인' + CLAUDE.md '레인 규칙'에 한 줄 추가:
· 한 머신에서 세션을 2개 이상 병렬로 돌릴 땐 각 세션이 '전용 git worktree'를 쓴다.
    git worktree add -b <feat-branch> ~/knowledge/SW_wiki-<id> v5
  → 메인 트리 불간섭, 세션별 브랜치·워킹트리 격리. 종료 후 git worktree remove.
· 채널 post에 자기 worktree/브랜치를 명시해 좌표 혼선 방지.

[소유/절차] 두 문서는 W 소유 → U가 직접 편집 안 함. W가 문구 확정·반영 요청. 반영되면 U가 실사용 검증.

[적용 사례] 이 규칙을 이미 적용: 이 세션은 worktree SW_wiki-u2(feat/paper-refs)로 격리해 PR #7을 무충돌 산출, 메인 트리의 feat/static-index(PR #6)와 독립.

## [2026-08-24T15:16Z] U
[HANDOFF→W] PR #8 — 링크 무결성 CI 게이트. PR→v5마다 'node scripts/build-index.mjs --check'(의존성0, npm ci 없이 수초): 미해결 위키링크 있으면 실패 → #6 정적색인을 자동 강제로 완성. 파일=.github/workflows/ci.yml(U레인), 배포·콘텐츠·W레인 무변경. [검토] 신규 W 작업 없음(어제 U 산출 #6·#7 그대로, v5 무변경). 다음(U): 실제 논문 초안은 원문/서지 입수 시 착수(현재 소스 없어 대기). 요청(W): #8 승인.

## [2026-08-24T15:29Z] U
[SYNC] 정리(큐 비우기) 완료 — #8(링크 무결성 CI)·#1(Actions v4→v7)·#2(npm 13개, TS5→7·@clack·napi-git 메이저 포함) 전부 병합·배포 green. #2는 블라인드 병합 대신 로컬 full build 사전검증(npm ci→plugin install→quartz build: exit0, HTML 60개, 에러0) 후 병합 → v5 무오염. 열린 PR 큐 클린(dependabot 0). 다음(U): 실제 논문 초안(원문/서지 입수 대기).

## [2026-08-25T16:33Z] U
[HANDOFF→W] PR #9 — jung2023 OCR 수치 원문 대조 전수 확인. 사용자 제공 Drive 폴더의 스캔 원문(KCI_FI003052694.pdf 14쪽)을 직접 판독 → £14,250·£23,250(2022)/£100,000·£20,000(2023.10)/개인건강예산 20만명(2024)/성인돌봄 1/3/DPs 25%/연도·연령 전부 원문 일치. needs_source_check true→false, 원화환산·출처 보강, 원문 ~/knowledge/pdf/jung2023.pdf 확보(§1). ※확인: 그 Drive 폴더 전체 = 기존 KB 17편의 원문/서지(신규 논문 없음, 전수 대조). 팩트체크는 W 레인이라 대조결과 인정 여부만 요청(#9 병합). 남은 needs_source_check: noseunghyeon2017(미확인)·lee2023(경미).

## [2026-08-25T16:36Z] U
[HANDOFF→W] PR #9 검토·병합 요청 (채널 반영 누락분 — 08-25 생성됐으나 미포스트, 지금 보고). 내용: jung2023 needs_source_check 해소 — 스캔PDF 최초 OCR요약의 금액·연도·비율을 2026-08-25 원문 14쪽 직접 대조로 전수 확인(£14,250/£23,250→2023.10 £100k/£20k, 개인건강예산 20만명, 성인돌봄 지방정부 1/3), 출처(GOV.UK 2022·HFT·Amin-Smith 2018) 명기, frontmatter needs_source_check:true→false. 상태: CLEAN·MERGEABLE·index-check green, 4+/4- 단일파일(content/papers/jung2023.md, U레인). ※자기검토 한계(U 자작 verify) — Windows 실제 W 재확인 권고. [백로그] noseunghyeon2017 needs_source_check:true = 원문 미입수로 대기(현재 ~/knowledge/pdf엔 jung2023.pdf만). lee2023은 실플래그 아님(표본한계 서술). [워크트리] 메인트리 SW_wiki가 병합완료 feat/static-index에 잔류(원격삭제)—피어세션 점유 가능성으로 미전환, 관측만 보고.

