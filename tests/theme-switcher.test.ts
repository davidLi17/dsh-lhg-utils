// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Context } from '@deepseek-ai/cordis'
import { afterEach, expect, it, vi } from 'vitest'
import { apply, ThemeSwitcher } from '../src/client/theme-switcher'
import { translate } from '../src/locales'

let root: Root | undefined
let container: HTMLDivElement | undefined
afterEach(async () => {
  await act(async () => root?.unmount())
  root = undefined
  container?.remove()
  vi.unstubAllGlobals()
})

async function setup() {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div'); document.body.append(container)
  root = createRoot(container)
  let preference: 'light' | 'dark' | 'system' = 'system'
  const listeners = new Set<() => void>()
  const update = (value: typeof preference) => { preference = value; listeners.forEach(listener => listener()) }
  const source = {
    getSnapshot: () => preference,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    setTheme: vi.fn((id: string) => update(id as typeof preference)),
  }
  await act(async () => root!.render(React.createElement(ThemeSwitcher, { source, t: translate() })))
  const trigger = () => container!.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!
  const click = async (button: HTMLButtonElement) => { await act(async () => button.click()) }
  const rows = () => [...container!.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
  return { source, update, listeners, trigger, click, rows }
}

it('uses official SVG choices, native selectedId/portal/focus and only writes the host preference', async () => {
  const s = await setup()
  expect(s.trigger().textContent).toBe('')
  expect(s.trigger().getAttribute('aria-label')).toBe('切换外观：跟随系统')
  expect(s.trigger().querySelector('svg')?.dataset.icon).toBe('system')
  expect(s.source.setTheme).not.toHaveBeenCalled()
  for (const [id, label] of [['light', '浅色'], ['dark', '深色'], ['system', '跟随系统']]) {
    await s.click(s.trigger())
    expect(s.rows().map(row => row.textContent)).toEqual(['浅色', '深色', '跟随系统'])
    expect(container!.firstElementChild?.getAttribute('data-portal')).toBe('true')
    expect(container!.firstElementChild?.getAttribute('data-autofocus')).toBe('true')
    expect(container!.firstElementChild?.getAttribute('data-align')).toBe('end')
    const row = s.rows().find(row => row.textContent === label)!
    expect(row.querySelector('svg')?.dataset.icon).toBe(id)
    await s.click(row)
    expect(s.source.setTheme).toHaveBeenLastCalledWith(id)
    expect(s.trigger().getAttribute('aria-expanded')).toBe('false')
    expect(s.trigger().querySelector('svg')?.dataset.icon).toBe(id)
    expect(s.trigger().getAttribute('aria-label')).toBe(`切换外观：${label}`)
  }
  expect(s.source.setTheme).toHaveBeenCalledTimes(3)
})

it('syncs external settings while open/closed, native dismissal writes nothing, and unmount unsubscribes', async () => {
  const s = await setup()
  expect(s.listeners.size).toBe(1)
  await act(async () => s.update('dark'))
  expect(s.trigger().getAttribute('aria-label')).toBe('切换外观：深色')
  await s.click(s.trigger())
  expect(s.rows().find(row => row.getAttribute('aria-current') === 'true')?.textContent).toBe('深色')
  await act(async () => s.update('system'))
  expect(s.rows().find(row => row.getAttribute('aria-current') === 'true')?.textContent).toBe('跟随系统')
  await s.click(container!.querySelector<HTMLButtonElement>('[data-dismiss]')!)
  expect(container!.querySelector('[role="menu"]')).toBeNull()
  await s.click(s.trigger()); await s.click(s.trigger())
  expect(container!.querySelector('[role="menu"]')).toBeNull()
  expect(s.source.setTheme).not.toHaveBeenCalled()
  await s.click(s.trigger())
  await act(async () => root!.unmount()); root = undefined
  expect(s.listeners.size).toBe(0)
  expect(container!.querySelector('[role="menu"]')).toBeNull()
})

it('waits for optional theme and registers only the non-exclusive official utilities slot', async () => {
  const ctx = new Context()
  const registrations: unknown[][] = []
  const names: string[] = []
  ctx.provide('slots', {
    inject: (name: string, callback: () => unknown) => { names.push(name); callback(); return () => {} },
    register: (...args: unknown[]) => { registrations.push(args); return () => {} },
  })
  ctx.provide('locale', {})
  const fork = ctx.plugin({ apply })!
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(registrations).toEqual([])
  ctx.provide('theme', { getTheme: () => ({ preference: 'light' }), setTheme: vi.fn() })
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(names).toEqual(['conversation.session.header.utilities'])
  expect(registrations[0]?.[0]).toMatchObject({ name: 'conversation.session.header.utilities', id: 'lhg-theme-switcher', locale: 'michengai.btw' })
  await fork.dispose(); await ctx.fiber.dispose()
})

it('shares the real host theme runtime: persisted choice, external adoption and system resolution stay native', async () => {
  const { readFileSync } = await import('node:fs')
  const { createRequire } = await import('node:module')
  const { runInNewContext } = await import('node:vm')
  const require = createRequire(import.meta.url)
  let ThemeRuntime!: typeof import('@deepseek-ai/dsh-client-ui-theme/client').ThemeRuntime
  const mediaListeners = new Set<() => void>()
  const media = { matches: false, addEventListener: (_: string, fn: () => void) => mediaListeners.add(fn), removeEventListener: (_: string, fn: () => void) => mediaListeners.delete(fn) }
  runInNewContext(readFileSync(require.resolve('@deepseek-ai/dsh-client-ui-theme/client'), 'utf8'), {
    matchMedia: () => media,
    window: { __ModuleLoader__: { load: (entry: { factory: (require: (id: string) => unknown) => { ThemeRuntime: typeof ThemeRuntime } }) => {
      ThemeRuntime = entry.factory(id => id.startsWith('react') ? require(id) : {}).ThemeRuntime
    } } },
  })
  const ctx = new Context()
  let preference: 'light' | 'dark' | 'system' = 'light'
  const hostListeners = new Set<() => void>()
  const host = {
    getSnapshot: () => ({ value: { preference, fontSize: 14, codeFontSize: 13, terminalFontSize: 13, textFontFamily: '', codeFontFamily: '', terminalFontFamily: '' } }),
    subscribe: (fn: () => void) => { hostListeners.add(fn); return () => { hostListeners.delete(fn) } },
    set: vi.fn(async (field: string, value: typeof preference) => {
      expect(field).toBe('preference'); preference = value; hostListeners.forEach(fn => fn()); return true
    }),
  }
  const runtime = new ThemeRuntime(ctx, host as never)
  let Component!: React.ComponentType<{ t: ReturnType<typeof translate> }>
  ctx.provide('theme', runtime)
  ctx.provide('locale', {})
  ctx.provide('slots', {
    inject: (_: string, callback: () => unknown) => { callback(); return () => {} },
    register: (_: unknown, component: typeof Component) => { Component = component; return () => {} },
  })
  const fork = ctx.plugin({ apply })!
  await new Promise(resolve => setTimeout(resolve, 0))
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  await act(async () => root!.render(React.createElement(Component, { t: translate() })))
  const trigger = () => container!.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!
  const choose = async (label: string) => {
    await act(async () => trigger().click())
    await act(async () => [...container!.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(row => row.textContent === label)!.click())
  }
  expect(trigger().getAttribute('aria-label')).toBe('切换外观：浅色')
  await choose('深色')
  expect(runtime.getTheme().preference).toBe('dark')
  expect(host.set).toHaveBeenLastCalledWith('preference', 'dark')
  await choose('跟随系统')
  await act(async () => { media.matches = true; mediaListeners.forEach(fn => fn()) })
  expect(runtime.getTheme().active.colorScheme).toBe('dark')
  expect(trigger().getAttribute('aria-label')).toBe('切换外观：跟随系统')
  await act(async () => { media.matches = false; mediaListeners.forEach(fn => fn()) })
  expect(runtime.getTheme().active.colorScheme).toBe('light')
  await act(async () => { preference = 'dark'; hostListeners.forEach(fn => fn()) })
  expect(trigger().getAttribute('aria-label')).toBe('切换外观：深色')
  expect(host.set).toHaveBeenCalledTimes(2)
  await act(async () => root!.unmount()); root = undefined
  await fork.dispose(); await ctx.fiber.dispose()
  expect(mediaListeners.size).toBe(0); expect(hostListeners.size).toBe(0)
})
