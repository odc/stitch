# ST Sync Command Requirements

## Overview
`st sync` 명령어는 knowledge base repository의 컴포넌트와 템플릿을 로컬 프로젝트로 동기화하는 기능을 제공합니다.

## 핵심 기능

### 1. Configuration 검증
- `stitch.yaml` 파일이 존재하는지 확인
- 파일이 없을 경우 오류 메시지 출력 및 종료
- 파일 구조 검증 (kb repository path, components 목록 등)

### 2. 선택적 컴포넌트 동기화
- `stitch.yaml`에 정의된 컴포넌트만 선별적으로 복사
- 복사 대상: knowledge base의 컴포넌트 → 프로젝트의 `docs/guidelines` 디렉토리
- 컴포넌트 구조 유지: `category/name/variation` 형식

### 3. 템플릿 동기화
- knowledge base의 `docs/template` 폴더 전체를 프로젝트의 `docs/template` 폴더로 복사
- 대상 디렉토리가 없을 경우 생성

### 4. 필수 파일 동기화
- `docs/guideline/ai-tools/workflow.md.mustache` 파일은 항상 복사
- 대상 디렉토리 구조가 없을 경우 생성

## 구현 세부사항

### 코드 구조
1. Command 등록
   - `src/commands/sync.ts` 생성
   - CLI 명령어 등록 (`src/cli.ts` 수정)

2. Service 구현
   - `src/services/sync.service.ts` 생성
   - Configuration 검증 로직
   - 파일/디렉토리 복사 로직
   - 에러 처리

3. Type 정의
   - 필요한 타입은 `src/types/kb.ts`에 추가

### 에러 처리
- Configuration 파일 누락
- Knowledge base repository 경로 오류
- 파일/디렉토리 접근 권한 오류
- 복사 작업 실패

### 테스트
- Unit 테스트
  - Configuration 검증
  - 파일/디렉토리 복사 로직
  - 에러 케이스
- Integration 테스트
  - 전체 sync 프로세스
  - 실제 파일시스템 동작 검증

## 코드 수정 필요 파일
1. `src/cli.ts`
   - sync 명령어 등록
   ```typescript
   import { registerSyncCommand } from './commands/sync'
   // ...
   registerSyncCommand(program)
   ```

2. `src/commands/sync.ts` (신규)
   - Command 인터페이스 구현
   - SyncService 호출
   - 에러 처리

3. `src/services/sync.service.ts` (신규)
   - Configuration 검증
   - 파일/디렉토리 복사 로직
   - 에러 처리

4. `src/types/kb.ts`
   - 필요한 타입 추가

## 구현 순서
1. 기본 Command 및 Service 구조 구현
2. Configuration 검증 로직 구현
3. 파일/디렉토리 복사 로직 구현
4. 에러 처리 추가
5. 테스트 코드 작성
6. 문서화
