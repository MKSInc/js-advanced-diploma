/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  const randomCharacter = Math.floor(Math.random() * allowedTypes.length);
  const randomLevel = Math.floor(1 + Math.random() * (maxLevel));
  yield new allowedTypes[randomCharacter](randomLevel);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = [];
  for (let i = 0; i < characterCount; i += 1) {
    team.push(characterGenerator(allowedTypes, maxLevel).next().value);
  }
  return team;
}
