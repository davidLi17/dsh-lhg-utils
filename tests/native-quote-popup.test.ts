// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Context } from '@deepseek-ai/cordis'
import { SlotCore } from '@deepseek-ai/dsh-client-ui-slots'
import { expect, it, vi } from 'vitest'
import { applyNativeQuotePopupSuppression, SuppressedQuoteAction } from '../src/client/native-quote-popup'

const slot = 'conversation.chat.text-interaction'
function fixture() {
  const core = new SlotCore()
  // Exercise the real host's keyed selection/shadowing, not a register-call mock.
  const register = core.register.bind(core) as (options: object, component: unknown) => () => void
  register({ name: 'root', children: {
    [slot]: { kind: 'keyed', scope: 'session' },
    'conversation.user.text.node': { kind: 'keyed', scope: 'session' },
  } }, () => null)
  const ctx = new Context()
  ctx.provide('slots', {
    inject: (_name: string, setup: () => () => void) => ctx.effect(setup),
    register,
  })
  return { core, register, ctx }
}

for (const nativeFirst of [true, false]) it(`real keyed registry shadows quote only; native first=${nativeFirst}`, async () => {
  const { core, register, ctx } = fixture()
  const Native = () => null
  const History = () => null
  const Other = () => null
  register({ name: 'conversation.user.text.node', key: 'quote', priority: 100 }, History)
  register({ name: slot, key: 'other' }, Other)
  if (nativeFirst) register({ name: slot, key: 'quote' }, Native)
  applyNativeQuotePopupSuppression(ctx)
  if (!nativeFirst) register({ name: slot, key: 'quote' }, Native)
  const selected = () => core.entriesOfSlot(slot).find(entry => entry.options.key === 'quote')?.component
  expect(selected()).toBe(SuppressedQuoteAction)
  expect(core.entriesOfSlot(slot).find(entry => entry.options.key === 'other')?.component).toBe(Other)
  expect(core.entriesOfSlot('conversation.user.text.node')[0]?.component).toBe(History)
  await ctx.fiber.dispose()
  expect(selected()).toBe(Native)
  expect(core.entriesOfSlot(slot)).toHaveLength(2)
})

it('dismisses only the supplied surface, renders nothing and preserves selection and LHG menu', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const host = document.createElement('div')
  host.innerHTML = '<p>selected text</p><div class="dca-menu">LHG menu</div><div class="native-surface"></div>'
  document.body.append(host)
  const range = document.createRange(); range.selectNodeContents(host.querySelector('p')!)
  const selection = window.getSelection()!; selection.removeAllRanges(); selection.addRange(range)
  const surface = host.querySelector<HTMLElement>('.native-surface')!
  const root = createRoot(surface)
  const clearSelection = vi.fn(), insertQuote = vi.fn(), send = vi.fn()
  const dismiss = vi.fn(() => { surface.style.visibility = 'hidden' })
  try {
    for (let n = 0; n < 3; n++) {
      await act(async () => root.render(React.createElement(SuppressedQuoteAction, { dismiss, clearSelection, insertQuote, send } as never)))
      expect(surface.textContent).toBe('')
      expect(surface.style.visibility).toBe('hidden')
      expect(selection.toString()).toBe('selected text')
      expect(host.querySelector('.dca-menu')?.textContent).toBe('LHG menu')
      await act(async () => root.render(null))
    }
    expect(dismiss).toHaveBeenCalledTimes(3)
    expect(clearSelection).not.toHaveBeenCalled(); expect(insertQuote).not.toHaveBeenCalled(); expect(send).not.toHaveBeenCalled()
  } finally {
    await act(async () => root.unmount()); host.remove(); selection.removeAllRanges(); vi.unstubAllGlobals()
  }
})
