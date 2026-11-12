import { describe, expect, it } from 'vitest'
import { CSS } from '../src/client/styles'

// Match native rc.2 dock geometry without altering LHG action/theme behavior.
describe('side-question dock follows host inset geometry', () => {
  it('subtracts four host insets from both available and maximum dock width', () => {
    const rule = CSS.match(/\.btw-dock\{([^}]+)\}/)?.[1] ?? ''
    const inset = ' - var(--dsh-composer-dock-inset,0px)'.repeat(4)
    expect(rule).toContain(`width:calc(100% - var(--dsh-composer-side-clearance,0px) - var(--dsh-composer-side-clearance,0px)${inset});`)
    expect(rule).toContain(`max-width:calc(var(--dsh-composer-card-max-width,100%)${inset});`)
  })
  it('keeps action wrapping, mobile targets and scoped answer styles', () => {
    expect(CSS).toMatch(/\.btw-header\{[^}]*flex-wrap:wrap/)
    expect(CSS).toMatch(/\.btw-actions\{[^}]*flex-wrap:wrap/)
    expect(CSS).toContain('.btw-actions button{width:36px;height:36px}')
    expect(CSS).toContain('.btw-actions button.btw-action-sidebar{min-height:36px}')
    expect(CSS).toMatch(/\.btw-answer-fallback p\{/)
    expect(CSS).not.toMatch(/\.btw-answer p\{/)
    expect(CSS).toContain('.btw-bubble{background:var(--dsw-alias-bg-layer-2)')
  })
})
