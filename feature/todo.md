# Implementation TODO

1. Core 구현

   - [ ] KB repository 구조 분석 및 파싱
     - [ ] 컴포넌트 메타데이터 파싱 (metadata.yaml)
     - [ ] Variation 메타데이터 파싱
     - [x] Default variation 처리 로직
   - [x] Git 관련 유틸리티 함수 구현 (commit hash 조회, 파일 동기화 등)
   - [x] stitch.yaml 파일 관리 (생성, 읽기, 업데이트)

2. CLI 명령어 구현

   - [x] `st init`
     - [x] KB repository 주소 입력 및 검증
     - [x] 사용 가능한 컴포넌트 목록 표시
     - [x] 컴포넌트별 사용 가능한 variation 목록 표시
     - [x] 컴포넌트와 variation 선택 UI
     - [x] stitch.yaml 초기 생성
   - [ ] `st sync`
     - [ ] 각 컴포넌트/variation별 최신 commit hash 확인
     - [ ] checked_version과 비교하여 업데이트 필요한 컴포넌트 목록 표시
     - [ ] 사용자 승인 후 선택적 동기화
     - [ ] 동기화 완료 후 버전 정보 업데이트

3. 테스트

   - [x] 테스트 환경 설정
     - [x] 임시 디렉토리 생성/정리 유틸리티 구현
     - [x] Git 저장소 초기화 및 조작 유틸리티 구현
   - [x] Mock KB repository 생성
     - [x] 기본 Repository 구조 생성 (ai-tools/windsurf, techstack/nestjs)
     - [x] 컴포넌트별 default variation 생성
     - [x] 실험용 variation 생성 및 메타데이터 추가
   - [ ] Integration 테스트 작성
     - [ ] Repository 초기화 및 구조 생성 테스트
     - [ ] Variation 선택 및 전환 테스트
     - [ ] 버전 관리 테스트 (current_version, checked_version)
     - [ ] 동기화 프로세스 테스트
     - [ ] 충돌 상황 테스트
   - [ ] E2E 테스트 시나리오 작성
     - [ ] st init 커맨드 테스트 (variation 선택 포함)
     - [ ] st sync 커맨드 테스트
     - [ ] 전체 워크플로우 테스트

4. 문서화
   - [ ] CLI 사용 가이드
   - [ ] KB repository 구조 가이드
     - [ ] 컴포넌트 구조 설명
     - [ ] Variation 개념 및 사용법
     - [ ] 메타데이터 파일 형식
   - [ ] 컴포넌트 버전 관리 가이드
     - [ ] Current/Checked 버전 개념 설명
     - [ ] Variation 관리 워크플로우
     - [ ] 실험적 문서 세트 사용 가이드

완료된 항목:

1. Core 구현

   - Default variation 처리 로직
   - Git 관련 유틸리티 함수 구현
   - stitch.yaml 파일 관리

2. CLI 명령어 구현

   - st init 명령어 전체 구현 완료
     - KB repository 검증
     - 컴포넌트 목록 표시
     - variation 선택
     - yaml 파일 생성/수정

3. 테스트
   - 테스트 환경 설정 완료
   - Mock KB repository 생성 및 테스트 완료

남은 항목:

1. Core 구현

   - KB repository 구조 분석 및 파싱
     - 컴포넌트 메타데이터 파싱
     - Variation 메타데이터 파싱

2. CLI 명령어 구현
   - st sync 명령어 전체 구현
