// Run inside each isolated host graph, against the rebuilt distributable.
import { readFileSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const base = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const root = join(base, 'node_modules')
const manifest = name => JSON.parse(readFileSync(join(root, '@deepseek-ai', name, 'package.json'), 'utf8'))
const imp = name => import(pathToFileURL(join(root, '@deepseek-ai', name, manifest(name).main)))
const implementation = await import(pathToFileURL(join(base, 'lib/index.js')))
const { Context } = await imp('cordis')
const { default: Loader } = await imp('cordis-plugin-loader')
const ctx = new Context()
const commands = new Map()
const original = () => []
const session = { deriveMessages: original, deriveEventMessage: original }
const tick = async () => { for (let i = 0; i < 16; i++) await new Promise(resolve => setImmediate(resolve)) }
ctx.provide('sessions', { list: () => [session] })
ctx.provide('commands', { register: command => { commands.set(command.name, command); return () => commands.delete(command.name) } })
ctx.provide('subagents', { getProvider: () => undefined })
ctx.provide('tools', {})
const warnings = []
ctx.logger.warn = (...args) => warnings.push(args)
try {
  const loader = new Loader(ctx)
  await tick() // Install the actual Loader's isolation hooks before creating entries.
  loader.builtins.lhg = implementation
  const id = await loader.create({ name: 'cordis:lhg', config: { btw: false, annotations: true } })
  await loader.await()
  await tick()
  const entry = loader.resolve(id)
  const fiber = entry.fiber
  assert.ok(fiber)
  // Cordis 4.1 separates raw configuration from the effective volatile references.
  const effective = () => fiber.ctx.fiber.effectiveConfig ?? fiber.config
  const ref = effective().btw
  assert.equal(ref.get(), false)
  assert.equal(commands.size, 0)
  assert.notEqual(session.deriveMessages, original)
  await entry.update({ config: { btw: true, annotations: false } })
  await tick()
  assert.equal(entry.fiber, fiber)
  assert.equal(effective().btw, ref)
  assert.equal(ref.get(), true)
  assert.ok(commands.has('btw'))
  assert.equal(session.deriveMessages, original)
  await entry.update({ config: { btw: 'invalid', annotations: false } })
  await tick()
  assert.equal(entry.fiber, fiber)
  assert.equal(ref.get(), true)
  assert.ok(commands.has('btw'))
  assert.ok(warnings.length > 0, 'The host must diagnose invalid configuration')
  await entry.update({ config: { btw: false, annotations: true } })
  await tick()
  assert.equal(entry.fiber, fiber)
  assert.equal(effective().btw, ref)
  assert.equal(ref.get(), false)
  assert.equal(commands.size, 0)
  assert.notEqual(session.deriveMessages, original)
  await ctx.fiber.dispose()
  assert.equal(session.deriveMessages, original)
  assert.equal(commands.size, 0)
  console.log(`Real Loader ${manifest('cordis-plugin-loader').version}: volatile updates, invalid-input preservation and disposal passed`)
} finally { await ctx.fiber.dispose() }
