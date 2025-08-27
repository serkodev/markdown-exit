import type { ParseOptions, ParseResult } from './parse'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import * as yaml from 'js-yaml'
import { globSync } from 'tinyglobby'
import { parse } from './parse'

export interface LoadResult extends Omit<ParseResult, 'meta'> {
  meta?: Record<string, unknown>
}

export interface GenerateOptions extends ParseOptions {
  header?: boolean
}

export function load(path: string, options?: ParseOptions): LoadResult | null {
  try {
    const data = readFileSync(path, 'utf8')

    const parsed = parse(data, options)
    if (!parsed)
      throw new Error(`Cannot parse input data: ${path}`)

    const meta = resolveParsedMeta(parsed.meta)
    if (meta)
      (parsed as LoadResult).meta = meta

    return parsed as LoadResult
  } catch {
    return null
  }
}

export function* generate(path: string | string[], options?: GenerateOptions) {
  const paths = globSync(path)

  for (const p of paths) {
    const data = load(p, options)

    if (!data)
      throw new Error(`Cannot load data from: ${p}`)

    const desc = typeof data.meta?.desc === 'string' ? data.meta.desc : basename(p)
    const skip = !!data.meta?.skip
    for (const fixture of data.fixtures) {
      yield {
        skip,
        desc,
        header: fixture.header && options?.header ? fixture.header : `line ${fixture.first.range[0] - 1}`,
        first: fixture.first.text,
        second: fixture.second.text,
      }
    }
  }
}

function resolveParsedMeta(meta: string | undefined): Record<string, unknown> | null {
  if (meta === undefined)
    return null
  try {
    const _meta = yaml.load(meta)
    if (_meta && typeof _meta === 'object')
      return _meta as Record<string, unknown>
  } catch {}
  return null
}
