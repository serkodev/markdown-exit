import { LinkifyIt } from 'linkify-it'
import { setLinkifyFactory } from './parser/linkify-it'

setLinkifyFactory(() => new LinkifyIt())

export * from './index.core'
export { default } from './index.core'
