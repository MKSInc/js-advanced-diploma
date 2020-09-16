import { calcAttackDefence } from './utils';

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const randomCharacter = Math.floor(Math.random() * allowedTypes.length);
    const randomLevel = Math.floor(1 + Math.random() * (maxLevel));
    const character = new allowedTypes[randomCharacter]({ level: randomLevel });
    for (let level = 1; level < character.level; level += 1) calcAttackDefence(character);
    yield character;
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  const generator = characterGenerator(allowedTypes, maxLevel);
  let currentChCount = 0;
  for (const character of generator) {
    if (currentChCount === characterCount) break;
    team.push(character);
    currentChCount += 1;
  }
  return team;
}
