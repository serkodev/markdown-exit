const own = Object.prototype.hasOwnProperty

let entities: Record<string, string> | undefined

/**
 * Sets the table of named character references, such as `&copy;`, that the
 * parser decodes. `markdown-exit` sets `character-entities` when it's
 * imported; `markdown-exit/core` leaves it to the app, so a bundle can load the
 * table only when a document needs it.
 */
export function setNamedEntities(table: Record<string, string>): void {
  entities = table
}

export function decodeNamedEntity(name: string): string | undefined {
  if (!entities)
    throw new Error('markdown-exit/core does not include the named entity table. Call `setNamedEntities(characterEntities)` with the table from `character-entities` before parsing `&name;` references.')
  return own.call(entities, name) ? entities[name] : undefined
}
