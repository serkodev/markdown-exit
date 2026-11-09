import { LinkifyIt } from 'linkify-it'
import * as ucmicro from 'uc.micro'
import { lib } from './common/utils'
import { setLinkifyFactory } from './parser/linkify-it'

setLinkifyFactory(() => new LinkifyIt())
lib.ucmicro = ucmicro

export * from './index.core'
export { default } from './index.core'
