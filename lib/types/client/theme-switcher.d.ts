import React from 'react';
import type { Context } from '@deepseek-ai/cordis';
import type { ThemeRuntime } from '@deepseek-ai/dsh-client-ui-theme/client';
import { type BtwTranslate } from '../locales';
type ThemeSource = {
    getSnapshot: () => ReturnType<ThemeRuntime['getTheme']>['preference'];
    subscribe: (listener: () => void) => () => void;
    setTheme: (id: string) => void;
};
/** The host owns preference, persistence and system resolution; this is only another entry point. */
export declare function ThemeSwitcher({ source, t }: {
    source: ThemeSource;
    t: BtwTranslate;
}): React.JSX.Element;
/** Optional native services: hosts without a theme service keep all existing utilities. */
export declare function apply(ctx: Context): void;
export {};
