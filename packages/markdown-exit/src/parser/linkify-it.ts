import type { LinkifyIt } from 'linkify-it'

let createLinkify: (() => LinkifyIt) | undefined

export function setLinkifyFactory(factory: () => LinkifyIt): void {
  createLinkify = factory
}

// `markdown-exit/core` registers no factory, so its instances start without one.
export function newLinkify(): LinkifyIt {
  return createLinkify?.() as LinkifyIt
}

export function requireLinkify(linkify: LinkifyIt | undefined): LinkifyIt {
  if (!linkify)
    throw new Error('markdown-exit/core does not include linkify-it. Set `md.linkify = new LinkifyIt()` before enabling `linkify`.')
  return linkify
}
