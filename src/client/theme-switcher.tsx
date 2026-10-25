import React, { useState, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ThemeRuntime } from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import {
  Button, Menu, Tooltip,
  IconLightOutlineMedium, IconDarkOutlineMedium, IconFollowsystemOutlineMedium,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { NS, type BtwTranslate } from '../locales'

const choices = [
  { id: 'light', Icon: IconLightOutlineMedium },
  { id: 'dark', Icon: IconDarkOutlineMedium },
  { id: 'system', Icon: IconFollowsystemOutlineMedium },
] as const

type ThemeSource = {
  getSnapshot: () => ReturnType<ThemeRuntime['getTheme']>['preference']
  subscribe: (listener: () => void) => () => void
  setTheme: (id: string) => void
}

/** The host owns preference, persistence and system resolution; this is only another entry point. */
export function ThemeSwitcher({ source, t }: { source: ThemeSource; t: BtwTranslate }): React.JSX.Element {
  const preference = useSyncExternalStore(source.subscribe, source.getSnapshot, source.getSnapshot)
  const [open, setOpen] = useState(false)
  const selected = choices.find(choice => choice.id === preference)
  const Icon = selected?.Icon ?? IconFollowsystemOutlineMedium
  const label = t('theme.switch', { theme: selected ? t(`theme.${selected.id}`) : preference })
  return <Menu
    open={open} onClose={() => setOpen(false)} align="end" portal autoFocus compact
    selectedId={preference}
    items={choices.map(({ id, Icon }) => ({ id, label: t(`theme.${id}`), icon: <Icon /> }))}
    onSelect={id => { source.setTheme(id); setOpen(false) }}
    anchor={<Tooltip label={label} side="bottom" align="end" portal disabled={open}>
      <Button type="button" size="sm" aria-label={label} aria-haspopup="menu" aria-expanded={open}
        style={{ width: 28, padding: 0, flexShrink: 0 }} onClick={() => setOpen(value => !value)}>
        <Icon />
      </Button>
    </Tooltip>}
  />
}

/** Optional native services: hosts without a theme service keep all existing utilities. */
export function apply(ctx: Context): void {
  ctx.inject(['theme', 'slots', 'locale'], scope => {
    const source: ThemeSource = {
      getSnapshot: () => scope.theme.getTheme().preference,
      subscribe: listener => scope.on('theme/change', listener),
      setTheme: id => scope.theme.setTheme(id),
    }
    scope.slots.inject('conversation.session.header.utilities', () => scope.slots.register({
      name: 'conversation.session.header.utilities', id: 'lhg-theme-switcher', order: 50, locale: NS,
    }, ({ t }: { t: BtwTranslate }) => <ThemeSwitcher source={source} t={t} />))
  })
}
