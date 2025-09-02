import type { ParseOptions, ParseResult } from './parse'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import * as yaml from 'js-yaml'
import { globSync } from 'tinyglobby'
import { parse as _parse } from './parse'

export interface LoadResult extends Omit<ParseResult, 'meta'> {
  meta?: Record<string, unknown>
}

export interface GenerateOptions extends ParseOptions {
  header?: boolean
  defaultDesc?: string
}

export function load(path: string, options?: ParseOptions): LoadResult | null {
  try {
    const data = readFileSync(path, 'utf8')
    return parse(data, options)
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

    yield* _generate(data, {
      ...options,
      ...!options?.defaultDesc && { defaultDesc: basename(p) },
    })
  }
}

export function* generateFromContent(content: string, options?: GenerateOptions) {
  const data = parse(content, options)

  if (!data)
    throw new Error(`Cannot load data`)

  yield* _generate(data, options)
}

function* _generate(data: LoadResult, options?: GenerateOptions) {
  const desc = typeof data.meta?.desc === 'string' ? data.meta.desc : (options?.defaultDesc ?? '')
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

function parse(data: string, options?: ParseOptions): LoadResult | null {
  try {
    const parsed = _parse(data, options)
    if (!parsed)
      throw new Error(`Cannot parse input data`)

    const meta = resolveParsedMeta(parsed.meta)
    if (meta)
      (parsed as LoadResult).meta = meta

    return parsed as LoadResult
  } catch {
    return null
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
