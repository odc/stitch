# Todo List

## Phase 1: Project Setup ✅

- [x] 프로젝트 초기화

  - [x] package.json 생성
  - [x] TypeScript 설정
  - [x] ESLint + Prettier 설정
  - [x] Jest 테스트 환경 구성

- [x] 기본 프로젝트 구조 생성

  ```
  src/
    ├── commands/
    ├── services/
    ├── utils/
    └── types/
  ```

- [x] CLI 프레임워크 설정
  - [x] commander.js 설치 및 설정
  - [x] 기본 명령어 구조 설계
  - [x] 글로벌 설치 스크립트 작성

## Phase 2: Core Features Implementation ✅

- [x] Git 서비스 구현

  - [x] Git 명령어 래퍼 작성
  - [x] Branch 관리 유틸리티 구현
  - [x] PR 관련 기능 구현

- [x] AI 통합
  - [x] Claude API 클라이언트 구현
  - [x] PR 요약 생성 로직 구현
  - [x] 컨텍스트 관리 유틸리티 작성

## Phase 3: Command Implementation ✅

- [x] `st pr` 구현
- [x] `st pp` 구현
- [x] `st feat` 구현

## Phase 4: Testing & Documentation

- [x] 단위 테스트 작성
- [x] ~~통합 테스트 작성~~ (수동 테스트로 대체)
- [x] ~~API 문서 작성~~ (불필요)
- [ ] 사용자 가이드 작성

## Phase 5: Publishing Setup

- [x] NPM 패키지 설정

  - [x] package.json 배포 설정 구성
    - [x] bin 필드 설정
    - [x] files 필드 설정
    - [x] engines 필드 설정
  - [ ] .npmignore 작성
  - [x] README.md 업데이트

- [x] 로컬 테스트 환경 구성

  - [x] npm link 스크립트 작성
  - [x] 개발용 환경변수 설정
  - [ ] 버전 관리 스크립트 작성

- [ ] CI/CD 파이프라인 구성
  - [ ] GitHub Actions 워크플로우 작성
    - [ ] 테스트 자동화
    - [ ] 버전 태깅
    - [ ] NPM 배포
  - [ ] semantic-release 설정

## Phase 6: Documentation

- [x] 개발 가이드 작성
  - [x] 로컬 개발 환경 설정 가이드
  - [x] npm link 사용 방법
  - [ ] 테스트 실행 방법
- [ ] 배포 프로세스 문서화
  - [ ] 버전 관리 정책
  - [ ] 배포 체크리스트
  - [ ] 릴리즈 노트 작성 가이드
