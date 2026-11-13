import { useLayoutEffect } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'

/** Dismiss only the native quote surface; keep the selection for our toolbar. */
export function SuppressedQuoteAction({ dismiss }: { dismiss: () => void }): null {
  useLayoutEffect(() => { dismiss() }, [dismiss])
  return null
}

/** Same-key shadowing preserves the native registration and restores it on disposal. */
export function applyNativeQuotePopupSuppression(ctx: Context): void {
  ctx.slots.inject('conversation.chat.text-interaction', () => ctx.slots.register({
    name: 'conversation.chat.text-interaction', key: 'quote', priority: -100,
  }, SuppressedQuoteAction))
}
