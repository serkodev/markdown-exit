import { characterEntities } from 'character-entities'
import { LinkifyIt } from 'linkify-it'
import { setNamedEntities } from './common/entities'
import { setLinkifyFactory } from './parser/linkify-it'

setLinkifyFactory(() => new LinkifyIt())
setNamedEntities(characterEntities)

export * from './index.core'
export { default } from './index.core'
