import * as mdurl from 'mdurl'
import punycode from 'punycode.js'

//
// This validator can prohibit more than really needed to prevent XSS. It's a
// tradeoff to keep code simple and to be secure by default.
//
// If you need different setup - override validator method as you wish. Or
// replace it with dummy function and use external sanitizer.
//

// eslint-disable-next-line regexp/no-unused-capturing-group
const BAD_PROTO_RE = /^(vbscript|javascript|file|data):/

// eslint-disable-next-line regexp/no-unused-capturing-group
const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/

export function validateLink(url: string) {
  // url should be normalized at this point, and existing entities are decoded
  const str = url.trim().toLowerCase()

  return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true
}

const RECODE_HOSTNAME_FOR = ['http:', 'https:', 'mailto:']

export function normalizeLink(url: string) {
  const parsed = mdurl.parse(url, true)

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.includes(parsed.protocol)) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname)
      } catch { /**/ }
    }
  }

  return mdurl.encode(mdurl.format(parsed))
}

export function normalizeLinkText(url: string) {
  const parsed = mdurl.parse(url, true)

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.includes(parsed.protocol)) {
      try {
        parsed.hostname = punycode.toUnicode(parsed.hostname)
      } catch { /**/ }
    }
  }

  // add '%' to exclude list because of https://github.com/markdown-it/markdown-it/issues/720
  return mdurl.decode(mdurl.format(parsed), `${mdurl.decode.defaultChars}%`)
}
