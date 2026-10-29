import { expect, it, vi } from 'vitest'
import { createSidechatBridge } from '../src/annotations/sidechat-bridge.js'

it.each([false, true])('optional sidebar decorator attaches and disposes (supported=%s)', supported => {
  const cleanups: (() => void)[] = []
  const release = vi.fn()
  const register = vi.fn(() => release)
  const candidate = { appendSidechatDraft: vi.fn(), ...(supported ? { registerSidechatAssistantDecorator: register } : {}) }
  const ctx = { inject: (_names: string[], fn: (scope: unknown) => void) => fn({
    get: () => candidate,
    effect: (fn: () => () => void) => cleanups.push(fn()),
  }) }
  const decorator = () => null
  const bridge = createSidechatBridge(ctx, decorator)
  expect(bridge.getSnapshot()).toBe(candidate)
  if (supported) expect(register).toHaveBeenCalledWith('lhg-annotations', decorator)
  const changed = vi.fn()
  bridge.subscribe(changed)
  cleanups.forEach(fn => fn())
  expect(bridge.getSnapshot()).toBeNull()
  expect(changed).toHaveBeenCalledTimes(1)
  expect(release).toHaveBeenCalledTimes(supported ? 1 : 0)
})

it('observes a Sidebar that arrives later and detaches across replacement', () => {
  let arrive: (scope: unknown) => void = () => { throw new Error('inject was not registered') }
  const bridge = createSidechatBridge({ inject: (_names: string[], fn: typeof arrive) => { arrive = fn } }, () => null)
  expect(bridge.getSnapshot()).toBeNull()
  const changed = vi.fn()
  const unsubscribe = bridge.subscribe(changed)
  const release = vi.fn()
  const candidate = { appendSidechatDraft: vi.fn(), registerSidechatAssistantDecorator: vi.fn(() => release) }
  let cleanup = () => {}
  const scope = { get: () => candidate, effect: (fn: () => () => void) => { cleanup = fn() } }
  arrive(scope)
  expect(candidate.registerSidechatAssistantDecorator).toHaveBeenCalledTimes(1)
  expect(bridge.getSnapshot()).toBe(candidate)
  expect(changed).toHaveBeenCalledTimes(1)
  cleanup()
  expect(release).toHaveBeenCalledTimes(1)
  expect(bridge.getSnapshot()).toBeNull()
  expect(changed).toHaveBeenCalledTimes(2)
  unsubscribe()
  arrive(scope)
  expect(bridge.getSnapshot()).toBe(candidate)
  expect(changed).toHaveBeenCalledTimes(2)
  cleanup()
})
