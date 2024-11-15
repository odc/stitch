# Todo List

## Phase 1: Project Setup

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

## Phase 2: Core Features Implementation

- [ ] Git 서비스 구현

  - [ ] Git 명령어 래퍼 작성
  - [ ] Branch 관리 유틸리티 구현
  - [ ] PR 관련 기능 구현

- [ ] AI 통합
  - [ ] OpenAI API 클라이언트 구현
  - [ ] PR 요약 생성 로직 구현
  - [ ] 컨텍스트 관리 유틸리티 작성

## Phase 3: Command Implementation

- [ ] `st pr` 구현
- [ ] `st pp` 구현
- [ ] `st feat` 구현

## Phase 4: Testing & Documentation

- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] API 문서 작성
- [ ] 사용자 가이드 작성

## Phase 5: Publishing Setup

- [ ] NPM 패키지 설정

  - [ ] package.json 배포 설정 구성
    - [ ] bin 필드 설정
    - [ ] files 필드 설정
    - [ ] engines 필드 설정
  - [ ] .npmignore 작성
  - [ ] README.md 업데이트

- [ ] 로컬 테스트 환경 구성

  - [ ] npm link 스크립트 작성
  - [ ] 개발용 환경변수 설정
  - [ ] 버전 관리 스크립트 작성

- [ ] CI/CD 파이프라인 구성
  - [ ] GitHub Actions 워크플로우 작성
    - [ ] 테스트 자동화
    - [ ] 버전 태깅
    - [ ] NPM 배포
  - [ ] semantic-release 설정

## Phase 6: Documentation

- [ ] 개발 가이드 작성
  - [ ] 로컬 개발 환경 설정 가이드
  - [ ] npm link 사용 방법
  - [ ] 테스트 실행 방법
- [ ] 배포 프로세스 문서화
  - [ ] 버전 관리 정책
  - [ ] 배포 체크리스트
  - [ ] 릴리즈 노트 작성 가이드
