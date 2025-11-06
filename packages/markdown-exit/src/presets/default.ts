// markdown-exit default options

import type { Preset } from '../types/preset'
import { defaultOptions } from '../parser'

const defaultPreset: Preset = {
  options: {
    ...defaultOptions,

    // Use '/' to close single tags (<br />)
    xhtmlOut: false,

    // Convert '\n' in paragraphs into <br>
    breaks: false,

    // CSS language prefix for fenced blocks
    langPrefix: 'language-',

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
  },

  components: {
    core: {},
    block: {},
    inline: {},
  },
}

export default defaultPreset
