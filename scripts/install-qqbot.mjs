/**
 * install-qqbot.mjs — 把腾讯官方 QQ Bot 插件装进便携包。
 *
 * 用法: node install-qqbot.mjs [portableRoot]
 *   portableRoot 省略时用脚本所在目录的上一级。
 *
 * 为什么不直接调 `dsh plugin add`：
 *   它内部 spawnSync("pnpm") 依赖系统 PATH 上的 pnpm，CI 和用户机器不一定有。
 *   这里直接调包内 pnpm，行为一致。
 *
 * 踩过的坑（务必保留这些注释）：
 *   1. profile 的 package.json 绝不能预写 "dependencies": {}。
 *      pnpm 见到空依赖直接回 "Already up to date"，什么都不装。
 *   2. profiles/node_modules 是 dsh 用 healProfilesModuleFallback 管的地盘，
 *      手动往里塞真目录会让启动直接报错 "remove it so dsh can manage"。
 *   3. MSYS/git-bash 建的符号链接 Windows 版 Node 不认，必须让 pnpm 自己建。
 *   4. 凭据走 QQBOT_APPID / QQBOT_SECRET 环境变量，不是 cordis.patch.yml
 *      （dump-config 里显示 __FROM_ENV__ 就是这个意思）。
 */

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
// 防御：Windows bat 里 "%~dp0" 的尾部反斜杠会转义掉闭引号，
// 参数可能变成 E:\...\portable"  —— 剥掉杂引号，别让用户撞。
function sanitizeRoot(raw) {
  if (!raw) return null
  return path.resolve(raw.replace(/["']/g, '').trim())
}

const PORTABLE = sanitizeRoot(process.argv[2]) ?? path.resolve(here, '..')

const SRC = path.join(PORTABLE, 'src')
const DSH_HOME = path.join(PORTABLE, 'data', '.dsh')
const PROFILES = path.join(DSH_HOME, 'profiles')
const PROFILE = 'qqbot'
const profileDir = path.join(PROFILES, PROFILE)
const PACKAGE = '@tencent-connect/dsh-qqbot'
// 锁定版本：CI 和用户机器上 registry 缓存可能仍指向旧的 latest
// （实测 CI 装到 0.4.0，而 npm 上 latest 已是 0.5.0）。
// 版本不一致 = 用户跑的不是验证过的代码，必须显式钉住。
const VERSION = '0.5.0'
const SPEC = `${PACKAGE}@${VERSION}`

function fail(message) {
  console.error('install-qqbot: ' + message)
  process.exit(1)
}

if (!fs.existsSync(SRC)) fail(`找不到 src 目录: ${SRC}`)

// ── 1. 找包内 pnpm ────────────────────────────────────────────
function findPnpm() {
  const pnpmDir = path.join(SRC, 'node_modules', '.pnpm')
  if (!fs.existsSync(pnpmDir)) return null
  const candidates = fs.readdirSync(pnpmDir).filter((d) => d.startsWith('pnpm@')).sort()
  for (const dir of candidates.reverse()) {
    const cjs = path.join(pnpmDir, dir, 'node_modules', 'pnpm', 'bin', 'pnpm.cjs')
    if (fs.existsSync(cjs)) return cjs
  }
  return null
}

const pnpmCjs = findPnpm()
const nodeExe = process.execPath

// ── 2. 建 profile 骨架 ───────────────────────────────────────
// 关键：只写 name + private，绝不写 dependencies（见文件头坑 1）。
fs.mkdirSync(profileDir, { recursive: true })

const pkgJsonPath = path.join(profileDir, 'package.json')
if (!fs.existsSync(pkgJsonPath)) {
  fs.writeFileSync(pkgJsonPath, JSON.stringify({
    name: `dsh-profile-${PROFILE}`,
    private: true,
  }, null, 2) + '\n')
  console.log('已建 profile package.json（无 dependencies 字段）')
}

// pnpm-workspace.yaml 决定 nodeLinker，必须跟 web profile 一致。
const wsPath = path.join(profileDir, 'pnpm-workspace.yaml')
if (!fs.existsSync(wsPath)) {
  const webWs = path.join(PROFILES, 'web', 'pnpm-workspace.yaml')
  if (fs.existsSync(webWs)) {
    fs.copyFileSync(webWs, wsPath)
  } else {
    fs.writeFileSync(wsPath, 'packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\n')
  }
  console.log('已建 pnpm-workspace.yaml')
}

// ── 3. 装包 ──────────────────────────────────────────────────
const alreadyInstalled = fs.existsSync(
  path.join(profileDir, 'node_modules', ...PACKAGE.split('/'), 'package.json'),
)

if (alreadyInstalled) {
  console.log('插件已安装，跳过 pnpm add')
} else {
  const args = pnpmCjs
    ? [pnpmCjs, 'add', SPEC]
    : ['add', SPEC]
  const cmd = pnpmCjs ? nodeExe : 'pnpm'

  console.log(`执行: ${pnpmCjs ? 'node <包内pnpm>' : 'pnpm'} add ${PACKAGE}`)
  const result = spawnSync(cmd, args, {
    cwd: profileDir,
    stdio: 'inherit',
    shell: !pnpmCjs && process.platform === 'win32',
  })
  if (result.error?.code === 'ENOENT') {
    fail('找不到 pnpm —— 包内没有 .pnpm/pnpm@*，系统也没装')
  }
  if ((result.status ?? 1) !== 0) fail(`pnpm add 失败，退出码 ${result.status}`)
}

// ── 4. 补 dsh.profile.bundles ────────────────────────────────
const manifest = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
if (!manifest.dependencies?.[PACKAGE]) {
  fail(`pnpm 没有把 ${PACKAGE} 写进 dependencies —— 检查是否预写了空 dependencies 对象`)
}
manifest.dsh = {
  profile: {
    bundles: ['@deepseek-ai/dsh-base', PACKAGE],
    patchReload: 'live',
  },
}
fs.writeFileSync(pkgJsonPath, JSON.stringify(manifest, null, 2) + '\n')
console.log('已写入 dsh.profile.bundles')

// ── 5. 验证 ──────────────────────────────────────────────────
const entry = path.join(profileDir, 'node_modules', ...PACKAGE.split('/'), 'dist', 'index.js')
if (!fs.existsSync(entry)) fail(`插件入口缺失: ${entry}`)

const installedVersion = JSON.parse(fs.readFileSync(
  path.join(profileDir, 'node_modules', ...PACKAGE.split('/'), 'package.json'), 'utf8',
)).version

// 硬校验：装出来的必须是钉住的版本。registry 缓存过期时 pnpm 会
// 静默给一个旧版本，那意味着用户跑的不是验证过的代码。
if (installedVersion !== VERSION) {
  fail(`版本不符：期望 ${VERSION}，实际装到 ${installedVersion}。`
    + ' registry 缓存可能过期，重试或加 --registry https://registry.npmjs.org')
}

console.log('')
console.log('安装完成')
console.log('  包版本   :', installedVersion)
console.log('  profile  :', profileDir)
console.log('  入口大小 :', fs.statSync(entry).size, 'bytes')
console.log('')
console.log('启动前设置凭据（环境变量，不是配置文件）:')
console.log('  QQBOT_APPID  = 你的 AppID')
console.log('  QQBOT_SECRET = 你的 AppSecret')
console.log('然后: dsh --profile qqbot')
