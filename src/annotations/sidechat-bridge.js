/** Optional Sidebar capability; the original annotation/BTW flows never depend on it. */
export function createSidechatBridge(ctx, decorateAssistant) {
  let service = null;
  const listeners = new Set();
  const notify = () => { for (const listener of listeners) listener(); };
  ctx.inject?.(['betterSidebar'], scope => {
    const candidate = scope.get('betterSidebar');
    if (typeof candidate?.appendSidechatDraft !== 'function') return;
    scope.effect(() => {
      const unregister = decorateAssistant && candidate.registerSidechatAssistantDecorator?.('lhg-annotations', decorateAssistant);
      service = candidate; notify();
      return () => { unregister?.(); if (service === candidate) { service = null; notify(); } };
    });
  });
  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot() { return service; },
  };
}
