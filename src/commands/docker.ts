import { Command } from 'commander'
import { exec } from 'child_process'
import { promisify } from 'util'
import chalk from 'chalk'
import inquirer from 'inquirer'
import * as fs from 'fs/promises'
import * as path from 'path'
import YAML from 'yaml'
import { StitchConfig } from '../types/kb'

const execAsync = promisify(exec)

interface DockerImage {
  repository: string
  tag: string
  id: string
  created: string
  size: string
}

async function getDockerImages(): Promise<DockerImage[]> {
  const { stdout } = await execAsync(
    'docker images --format "{{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}"'
  )
  return stdout
    .trim()
    .split('\n')
    .map((line) => {
      const [repository, tag, id, created, size] = line.split('\t')
      return { repository, tag, id, created, size }
    })
}

async function readStitchConfig(): Promise<StitchConfig> {
  try {
    const configPath = path.join(process.cwd(), 'stitch.yaml')
    const content = await fs.readFile(configPath, 'utf8')
    return YAML.parse(content)
  } catch (error) {
    throw new Error(
      'stitch.yaml 파일을 찾을 수 없습니다. `st init` 명령어로 초기화해주세요.'
    )
  }
}

async function getKeepImages(): Promise<string[]> {
  const config = await readStitchConfig()

  if (!config.docker?.keepImages) {
    const { images } = await inquirer.prompt([
      {
        type: 'input',
        name: 'images',
        message: '보존할 도커 이미지 패턴을 입력하세요 (콤마로 구분):',
        default: 'mysql,postgres,supabase',
        validate: (input: string) => {
          if (!input.trim()) return '최소 하나의 패턴을 입력해야 합니다.'
          return true
        },
      },
    ])

    const keepImages = images
      .split(',')
      .map((p: string) => p.trim())
      .filter(Boolean)

    // 설정 파일 업데이트
    config.docker = { keepImages }
    await fs.writeFile(
      path.join(process.cwd(), 'stitch.yaml'),
      YAML.stringify(config)
    )

    console.log(chalk.green('✓ 설정이 저장되었습니다.'))
    return keepImages
  }

  return config.docker.keepImages
}

async function filterImagesToKeep(
  images: DockerImage[]
): Promise<DockerImage[]> {
  const keepPatterns = await getKeepImages()
  const imagesByRepo = new Map<string, DockerImage[]>()

  // 이미지들을 레포지토리별로 그룹화
  images.forEach((img) => {
    if (!imagesByRepo.has(img.repository)) {
      imagesByRepo.set(img.repository, [])
    }
    imagesByRepo.get(img.repository)?.push(img)
  })

  const imagesToDelete: DockerImage[] = []

  // 각 레포지토리별로 처리
  for (const [repo, repoImages] of imagesByRepo.entries()) {
    // 보존할 패턴과 일치하는지 확인
    const shouldKeepAll = keepPatterns.some((pattern) =>
      repo.toLowerCase().includes(pattern.toLowerCase())
    )

    if (shouldKeepAll) {
      // 패턴과 일치하는 이미지는 모두 유지 (삭제 목록에 추가하지 않음)
      continue
    } else {
      // 패턴과 일치하지 않는 이미지는 최신 버전 하나만 남기고 나머지 삭제
      const sortedImages = repoImages.sort((a, b) => {
        const aTime = new Date(a.created).getTime()
        const bTime = new Date(b.created).getTime()
        return bTime - aTime
      })
      imagesToDelete.push(...sortedImages.slice(1))
    }
  }

  return imagesToDelete
}

async function confirmAndDeleteImages(images: DockerImage[]): Promise<void> {
  const allImages = await getDockerImages()
  const imagesToKeep = allImages.filter(
    (img) => !images.some((delImg) => delImg.id === img.id)
  )

  console.log(chalk.cyan(`\n전체 이미지: ${allImages.length}개`))
  console.log(chalk.green(`보존할 이미지: ${imagesToKeep.length}개`))
  console.log(chalk.yellow(`삭제할 이미지: ${images.length}개`))

  if (images.length === 0) {
    console.log(chalk.green('✨ 삭제할 이미지가 없습니다.'))
    return
  }

  console.log(chalk.green('\n💾 보존할 이미지 목록:'))
  imagesToKeep.forEach((img) => {
    console.log(
      `${chalk.cyan(img.repository)}:${chalk.blue(img.tag)} (${chalk.gray(
        img.created
      )}) - ${chalk.magenta(img.size)}`
    )
  })

  console.log(chalk.yellow('\n🗑️  삭제될 이미지 목록:'))
  images.forEach((img) => {
    console.log(
      `${chalk.cyan(img.repository)}:${chalk.blue(img.tag)} (${chalk.gray(
        img.created
      )}) - ${chalk.magenta(img.size)}`
    )
  })

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `총 ${images.length}개의 이미지를 삭제하시겠습니까?`,
      default: false,
    },
  ])

  if (confirm) {
    for (const img of images) {
      try {
        await execAsync(`docker rmi -f ${img.id}`)
        console.log(chalk.green(`✓ 삭제 완료: ${img.repository}:${img.tag}`))
      } catch (error) {
        console.error(
          chalk.red(`✗ 삭제 실패: ${img.repository}:${img.tag} - ${error}`)
        )
      }
    }
    console.log(chalk.green('\n✨ 이미지 정리가 완료되었습니다.'))
  } else {
    console.log(chalk.yellow('\n작업이 취소되었습니다.'))
  }
}

async function updateKeepImages(): Promise<void> {
  const config = await readStitchConfig()
  const currentPatterns = config.docker?.keepImages || []

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '어떤 작업을 하시겠습니까?',
      choices: [
        { name: '현재 설정 보기', value: 'view' },
        { name: '패턴 추가', value: 'add' },
        { name: '패턴 제거', value: 'remove' },
      ],
    },
  ])

  if (action === 'view') {
    console.log('\n현재 보존할 이미지 패턴:')
    if (currentPatterns.length === 0) {
      console.log(chalk.yellow('설정된 패턴이 없습니다.'))
    } else {
      currentPatterns.forEach((pattern) => {
        console.log(chalk.cyan(`- ${pattern}`))
      })
    }
    return
  }

  if (action === 'add') {
    const { newPattern } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newPattern',
        message: '추가할 패턴을 입력하세요:',
        validate: (input: string) => {
          if (!input.trim()) return '패턴을 입력해야 합니다.'
          if (currentPatterns.includes(input.trim()))
            return '이미 존재하는 패턴입니다.'
          return true
        },
      },
    ])

    config.docker = {
      keepImages: [...currentPatterns, newPattern.trim()],
    }
  }

  if (action === 'remove') {
    if (currentPatterns.length === 0) {
      console.log(chalk.yellow('제거할 패턴이 없습니다.'))
      return
    }

    const { patterns } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'patterns',
        message: '제거할 패턴을 선택하세요:',
        choices: currentPatterns.map((p) => ({ name: p, value: p })),
        validate: (input: string[]) => {
          if (input.length === 0) return '최소 하나의 패턴을 선택해야 합니다.'
          return true
        },
      },
    ])

    config.docker = {
      keepImages: currentPatterns.filter((p) => !patterns.includes(p)),
    }
  }

  await fs.writeFile(
    path.join(process.cwd(), 'stitch.yaml'),
    YAML.stringify(config)
  )
  console.log(chalk.green('✓ 설정이 저장되었습니다.'))
}

export const dockerCommand = new Command('docker')
  .description('도커 관련 유틸리티')
  .addCommand(
    new Command('clean')
      .description('사용하지 않는 도커 이미지 정리')
      .action(async () => {
        try {
          const images = await getDockerImages()
          const imagesToDelete = await filterImagesToKeep(images)
          await confirmAndDeleteImages(imagesToDelete)
        } catch (error) {
          console.error(chalk.red('오류가 발생했습니다:'), error)
        }
      })
  )
  .addCommand(
    new Command('config')
      .description('도커 이미지 보존 설정 관리')
      .action(async () => {
        try {
          await updateKeepImages()
        } catch (error) {
          console.error(chalk.red('오류가 발생했습니다:'), error)
        }
      })
  )
