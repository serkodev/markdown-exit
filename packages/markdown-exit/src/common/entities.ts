import { characterEntities } from 'character-entities'

const own = Object.prototype.hasOwnProperty

export function decodeNamedEntity(name: string): string | undefined {
  return own.call(characterEntities, name) ? characterEntities[name] : undefined
}
