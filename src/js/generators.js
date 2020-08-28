import { calcAttackDefence } from './utils';

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while (true) {
    const randomCharacter = Math.floor(Math.random() * allowedTypes.length);
    const randomLevel = Math.floor(1 + Math.random() * (maxLevel));
    const character = new allowedTypes[randomCharacter]({ level: randomLevel });
    for (let level = 1; level < character.level; level += 1) {
      character.attack = calcAttackDefence(character.attack, character.health);
      character.defence = calcAttackDefence(character.defence, character.health);
    }
    yield character;
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = [];
  const generator = characterGenerator(allowedTypes, maxLevel);
  let currentChCount = 0;
  for (const character of generator) {
    team.push(character);
    currentChCount += 1;
    if (currentChCount === characterCount) break;
  }
  return team;
}
