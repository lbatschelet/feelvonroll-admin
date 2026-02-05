/**
 * Language helpers for filtering active languages.
 * Exports: getActiveLanguages.
 */
export function getActiveLanguages(languages) {
  return languages.filter((language) => language.enabled)
}
