import type { Context } from '@deepseek-ai/cordis';
/** Dismiss only the native quote surface; keep the selection for our toolbar. */
export declare function SuppressedQuoteAction({ dismiss }: {
    dismiss: () => void;
}): null;
/** Same-key shadowing preserves the native registration and restores it on disposal. */
export declare function applyNativeQuotePopupSuppression(ctx: Context): void;
