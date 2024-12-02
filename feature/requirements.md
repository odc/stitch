# Knowledge Base Sync Feature Requirements

## Overview
Stitch CLI tool에 Knowledge Base Repository와의 동기화 기능을 추가합니다. 이 기능은 원격의 KB repository에서 필요한 문서들을 로컬 프로젝트로 가져오는 것을 목적으로 합니다.

## Core Features

### 1. `st init` - 프로젝트 초기화
- stitch.yaml 설정 파일 생성
  - KB repository 주소 설정
  - 프로젝트 preferences 설정
  - Tech stack component 선택 정보 저장
- Tech stack component 선택 기능
  - KB repository 구조 분석
  - 사용자가 필요한 component 선택

### 2. `st sync` - 문서 동기화
- KB repository에서 로컬로 단방향 동기화
- 동기화 범위:
  - stitch.yaml의 preference에 따른 문서 선택
  - 선택된 문서들의 버전 정보 관리
- 충돌 처리:
  - Git을 통한 수동 충돌 해결
  - 사용자가 직접 관리

## Technical Specifications

### Configuration (stitch.yaml)
```yaml
kb:
  repository: string  # KB repository URL
components:
  - category: string   # Category (e.g., 'ai-tools', 'techstack')
    name: string      # Component name (e.g., 'windsurf', 'nestjs')
    variation: string # Variation name (default if not specified)
    current_version: string   # 현재 프로젝트에서 사용 중인 버전의 commit hash
    checked_version: string   # 사용자가 마지막으로 검토한 버전의 commit hash
preferences:
  # Project specific preferences
```

예시:
```yaml
kb:
  repository: "https://github.com/example/kb-repo"
components:
  - category: "ai-tools"
    name: "windsurf"
    variation: "experimental-v1"  # 실험적 문서 세트 사용
    current_version: "abc123"     # 현재 사용 중인 v1 버전
    checked_version: "def456"     # 검토 완료한 v2 버전
  - category: "techstack"
    name: "nestjs"
    # variation이 없으면 자동으로 "default" 사용
    current_version: "xyz789"     # 현재 사용 중인 버전
    checked_version: "xyz789"     # 마지막으로 검토한 버전 (업데이트 없음)
```

각 컴포넌트는 다음 정보를 관리합니다:
- category와 name: KB repository의 문서 위치
- variation: 사용할 문서 variation (미지정시 "default")
- current_version: 프로젝트에서 실제로 사용 중인 문서의 버전
- checked_version: 사용자가 마지막으로 검토한 버전

이를 통해:
- KB repository에 새 버전이 있더라도, checked_version과 다른 경우에만 업데이트를 제안
- 사용자는 검토 후에도 이전 버전(current_version)을 계속 사용 가능
- 특정 컴포넌트의 문서를 원하는 버전으로 유지 가능
- 실험적인 문서 세트(variation)를 선택적으로 사용 가능

### Security & Access
- Repository 접근 권한은 사용자 시스템의 Git 설정을 따름
- 별도의 인증 시스템 없음

### Version Management
- 문서 버전 관리는 Git commit hash를 통해 단순하게 관리
- 동기화 시점의 commit hash를 stitch.yaml에 기록

### Testing Strategy
- 실제 Git 저장소를 시뮬레이션하기 위해 임시 디렉토리에 테스트용 KB repository 생성
- 테스트 시나리오:
  1. 임시 디렉토리에 Git 저장소 초기화
  2. KB repository 구조 생성 (ai-tools/windsurf, techstack/nestjs 등)
  3. 여러 버전의 문서를 커밋하여 테스트 데이터 준비
  4. 실제 Git 명령어를 사용하여 동기화 테스트
  5. 테스트 완료 후 임시 디렉토리 정리
- 이를 통해 실제 환경과 동일한 조건에서 안전하게 테스트 가능
