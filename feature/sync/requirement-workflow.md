# Workflow Rendering Requirements

## Overview
`st sync` 명령어 실행 시 `workflow.md.mustache` 템플릿을 렌더링하여 실제 `workflow.md` 파일을 생성해야 합니다.

## 핵심 기능

### 1. Rendering Context 생성
- `docs/guidelines` 디렉토리의 구조를 분석하여 렌더링 컨텍스트 생성
- 컨텍스트 구조:
  ```typescript
  interface RenderingContext {
    categories: Array<{
      name: string;
      components: Array<{
        name: string;
        relative_path: string;
      }>;
    }>;
  }
  ```

### 2. Mustache 템플릿 렌더링
- `workflow.md.mustache` 파일을 읽어서 Mustache 템플릿으로 처리
- 생성된 컨텍스트를 사용하여 템플릿 렌더링
- 결과를 `workflow.md`로 저장

## 구현 세부사항

### 코드 수정
1. `src/services/sync.service.ts`
   ```typescript
   // 새로운 메서드 추가
   private async generateRenderingContext(): Promise<RenderingContext> {
     const guidelinesPath = path.join(process.cwd(), 'docs/guidelines');
     const categories = await fs.readdir(guidelinesPath);
     
     return {
       categories: await Promise.all(
         categories.map(async (category) => {
           const categoryPath = path.join(guidelinesPath, category);
           const components = await fs.readdir(categoryPath);
           
           return {
             name: category,
             components: await Promise.all(
               components.map(async (component) => ({
                 name: component,
                 relative_path: path.join('docs/guidelines', category, component)
               }))
             )
           };
         })
       )
     };
   }

   // syncWorkflowFile 메서드 수정
   private async syncWorkflowFile(config: StitchConfig): Promise<void> {
     const sourceFile = path.join(
       config.kb.repository,
       'docs/guidelines/ai-tools/workflow.md.mustache'
     );
     const targetMustacheFile = path.join(
       process.cwd(),
       'docs/guidelines/ai-tools/workflow.md.mustache'
     );
     const targetFile = path.join(
       process.cwd(),
       'docs/guidelines/ai-tools/workflow.md'
     );

     // 1. Copy mustache template
     await fs.ensureDir(path.dirname(targetMustacheFile));
     await fs.copy(sourceFile, targetMustacheFile);

     // 2. Generate rendering context
     const context = await this.generateRenderingContext();

     // 3. Render template
     const template = await fs.readFile(targetMustacheFile, 'utf-8');
     const rendered = Mustache.render(template, context);

     // 4. Save rendered file
     await fs.writeFile(targetFile, rendered);
   }
   ```

2. `package.json`
   ```json
   {
     "dependencies": {
       "mustache": "^4.2.0"
     }
   }
   ```

### 테스트 수정
1. `src/commands/__tests__/sync.test.ts`
   ```typescript
   it('should render workflow.md from mustache template', async () => {
     await createDefaultStitchConfig();
     
     // Create test directory structure
     const guidelinesPath = path.join(projectDir, 'docs/guidelines');
     await fs.ensureDir(path.join(guidelinesPath, 'tech-stack/nestjs'));
     await fs.ensureDir(path.join(guidelinesPath, 'tech-stack/typescript'));
     
     await syncCommand({ inputProvider: mockInputProvider, outputProvider });

     // Check if both mustache template and rendered file exist
     const mustachePath = path.join(
       projectDir,
       'docs/guidelines/ai-tools/workflow.md.mustache'
     );
     const renderedPath = path.join(
       projectDir,
       'docs/guidelines/ai-tools/workflow.md'
     );
     
     const mustacheExists = await fs.pathExists(mustachePath);
     const renderedExists = await fs.pathExists(renderedPath);
     
     expect(mustacheExists).toBe(true);
     expect(renderedExists).toBe(true);

     // Verify rendered content
     const content = await fs.readFile(renderedPath, 'utf-8');
     expect(content).toContain('tech-stack');
     expect(content).toContain('nestjs');
     expect(content).toContain('typescript');
     expect(content).toContain('docs/guidelines/tech-stack/nestjs');
   });
   ```

## 구현 순서
1. Mustache 패키지 설치
2. RenderingContext 타입 정의
3. generateRenderingContext 메서드 구현
4. syncWorkflowFile 메서드 수정
5. 테스트 케이스 추가 및 수정

## 주의사항
1. 디렉토리가 없는 경우 적절한 에러 처리
2. 렌더링 실패 시 에러 처리
3. 파일 시스템 작업 실패 시 에러 처리
4. 디버그 모드에서 적절한 로깅
