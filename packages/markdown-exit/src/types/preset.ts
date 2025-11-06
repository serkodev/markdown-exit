import type { MarkdownExitOptions } from '..'
import type { BlockRule } from '../parser/block/parser_block'
import type { CoreRule } from '../parser/core/parser_core'
import type { InlineRule, InlineRule2 } from '../parser/inline/parser_inline'

export interface Preset {
  options: Required<MarkdownExitOptions>
  components: {
    core: {
      rules?: CoreRule[]
    }
    block: {
      rules?: BlockRule[]
    }
    inline: {
      rules?: InlineRule[]
      rules2?: InlineRule2[]
    }
  }
}
