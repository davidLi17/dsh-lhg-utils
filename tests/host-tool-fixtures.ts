import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { ToolCallId } from '@deepseek-ai/dsh-llm'
import type { ToolExecutionResult } from '@deepseek-ai/dsh-tools'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const defaultRoot = fileURLToPath(new URL('../node_modules', import.meta.url))

/** rc.1 moves execution out of the registry. Mount the real official provider,
 * just as the host composition does; never substitute an allow-all mock. */
export async function installHostToolExecutor(ctx: Context, root = defaultRoot): Promise<void> {
  if (typeof ctx.tools.setExecutor !== 'function') return // 0.2.1's integrated executor.
  const url = pathToFileURL(join(root, '@deepseek-ai/dsh-tool-executor-native/lib/index.js')).href
  const executor = await import(/* @vite-ignore */ url)
  await ctx.plugin(executor).await()
}

/** Adapt test invocations to the inspected host API, not the plugin runtime. */
export async function executeHostTool(ctx: Context, input: {
  name: string; callId: ToolCallId; arguments: unknown; signal: AbortSignal; agent?: Agent
}): Promise<ToolExecutionResult> {
  if (typeof ctx.tools.setExecutor === 'function') {
    const result = await ctx.tools.execute({
      calls: [{ type: 'tool-call', id: input.callId, name: input.name, arguments: JSON.stringify(input.arguments) }],
      signal: input.signal, agent: input.agent,
    })
    if (result.results.length !== 1 || result.results[0]?.callId !== input.callId) throw new Error('Host batch lost the requested tool call')
    return result.results[0].result
  }
  return (ctx.tools as unknown as { execute(value: typeof input): Promise<ToolExecutionResult> }).execute(input)
}
