# Nest.js 프로젝트 구조 가이드

## 디렉토리 구조 (예시)

```
src/
├── agent/                 # 에이전트 관련 모듈
│   ├── agent.module.ts
│   ├── agent.service.ts
│   └── types/
├── chatbots/             # 챗봇 관련 모듈
│   ├── chatbots.module.ts
│   ├── chatbots.controller.ts
│   └── chatbots.service.ts
├── langgraph/            # Langgraph 독립 모듈
│   ├── create-agent.ts
│   └── agent.environment.ts
└── llm/                  # LLM 관련 모듈
    ├── llm.module.ts
    └── types/
```

## 모듈 패턴

### 기본 모듈 구조

```typescript
@Module({
  imports: [...],      // 의존하는 모듈
  controllers: [...],  // HTTP 엔드포인트
  providers: [...],    // 서비스 및 프로바이더
  exports: [...],      // 다른 모듈에서 사용할 컴포넌트
})
export class YourModule {}
```

### 컨트롤러 패턴

```typescript
@Controller('resource')
export class YourController {
  constructor(private service: YourService) {}

  @Get()
  async findAll(): Promise<Resource[]> {
    return this.service.findAll()
  }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  async create(@Body() dto: CreateResourceDto): Promise<Resource> {
    return this.service.create(dto)
  }
}
```

### 서비스 패턴

```typescript
@Injectable()
export class YourService {
  constructor(
    @InjectRepository(YourEntity)
    private repository: Repository<YourEntity>,
    private otherService: OtherService
  ) {}

  async findAll(): Promise<YourEntity[]> {
    return this.repository.find()
  }
}
```

## 테스트 패턴

### 단위 테스트 (`*.spec.ts`)

```typescript
describe('YourService', () => {
  let service: YourService
  let mockRepository: MockType<Repository<YourEntity>>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: getRepositoryToken(YourEntity),
          useFactory: createMockRepository,
        },
      ],
    }).compile()

    service = module.get(YourService)
    mockRepository = module.get(getRepositoryToken(YourEntity))
  })

  it('should find all entities', async () => {
    const expected = [
      /* test data */
    ]
    mockRepository.find.mockReturnValue(expected)
    expect(await service.findAll()).toBe(expected)
  })
})
```

### E2E 테스트 (`*.e2e-spec.ts`)

```typescript
describe('YourController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/resource (GET)', () => {
    return request(app.getHttpServer()).get('/resource').expect(200).expect([
      /* expected response */
    ])
  })

  afterAll(async () => {
    await app.close()
  })
})
```

## 보안 패턴

### 인증 가드

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    return validateAuth(request)
  }
}
```

### 권한 가드

```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    )
    return validateRoles(request, requiredRoles)
  }
}
```

## 모범 사례

1. 모듈 구성

   - 기능별로 모듈 분리
   - 순환 의존성 방지
   - 명확한 책임 범위 정의

2. 컨트롤러

   - 경로명은 복수형 사용 (`/chatbots`)
   - DTO를 통한 데이터 검증
   - 적절한 HTTP 상태 코드 사용

3. 서비스

   - 비즈니스 로직 캡슐화
   - 트랜잭션 관리
   - 에러 처리 표준화

4. 테스트
   - 격리된 테스트 환경
   - 모든 엔드포인트 테스트
   - 에러 케이스 포함
