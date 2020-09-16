// eslint-disable-next-line object-curly-newline
import { Bowman, Daemon, Magician, Swordsman, Undead, Vampire } from './CharacterTypes';
import PositionedCharacter from './PositionedCharacter';

export function convertIndexToCoordinates(index, boardSize) {
  return { x: index % boardSize, y: Math.floor(index / boardSize) };
}

export function calcTileType(index, boardSize) {
  // TODO: write logic here
  const { x, y } = convertIndexToCoordinates(index, boardSize);
  if (x === 0) {
    if (y === 0) return 'top-left';
    if (y === boardSize - 1) return 'bottom-left';
    return 'left';
  }
  if (x === boardSize - 1) {
    if (y === 0) return 'top-right';
    if (y === boardSize - 1) return 'bottom-right';
    return 'right';
  }
  if (y === 0) return 'top';
  if (y === boardSize - 1) return 'bottom';
  return 'center';
}

/**
 * Generates random positions
 *
 * @param characterCount количество персонажей в команде
 * @param player 'user' или 'bot'
 * @param boardSize ширина поля
 * @returns array с позициями для персонажей
 */
export default function generateRandomPositions(characterCount, player, boardSize = 8) {
  const positions = [];
  const possiblePositions = [];
  for (let i = 0; i < boardSize ** 2; i += boardSize) {
    if (player === 'user') possiblePositions.push(i, i + 1);
    if (player === 'bot') possiblePositions.push(i + boardSize - 2, i + boardSize - 1);
  }
  let possibleCountPos = boardSize * 2;
  for (let i = 0; i < characterCount; i += 1) {
    const position = Math.floor(Math.random() * possibleCountPos);
    positions.push(possiblePositions[position]);
    possiblePositions.splice(position, 1);
    possibleCountPos -= 1;
  }
  return positions;
}

/**
 * Расчитывает атаку и защиту персонажа
 *
 * @param character - объект наследник Character
 */
export function calcAttackDefence(character) {
  const ch = character;
  ch.attack += ch.baseAttack * 0.20;
  ch.defence += ch.baseDefence * 0.20;
  if (ch.attack > ch.maxAttack) ch.attack = ch.maxAttack;
  if (ch.defence > ch.maxDefence) ch.defence = ch.maxDefence;
}

export function checkDistance(index, selectedCharacter, action, boardSize) {
  const start = { ...convertIndexToCoordinates(selectedCharacter.position, boardSize) };
  const end = { ...convertIndexToCoordinates(index, boardSize) };
  const actionRange = action === 'move' ? 'movementRange' : 'attackRange';
  return (Math.abs(start.x - end.x) <= selectedCharacter.character[actionRange])
    && (Math.abs(start.y - end.y) <= selectedCharacter.character[actionRange]);
}

/**
 * Посчитать урон по цели
 *
 * @param attacker - атакующий - объект наследник Character
 * @param target - цель - объект наследник Character
 * @returns number - урон нанесенный цели
 */
export function calcDamage(attacker, target) {
  const absorbedDamage = (attacker.attack * (target.defence / 100));
  return Math.round(parseFloat((attacker.attack - absorbedDamage).toFixed(1)));
}

// Наносит урон по персонажу, если персонаж уничтожен, то удаляет его из комманды
export function makeDamage(damage, posCharacter, team) {
  const { character: target } = posCharacter;
  target.health -= damage;
  if (target.health <= 0) team.deleteMember(posCharacter);
  else target.health = parseFloat(target.health.toFixed(1));
}

/**
 * Для персонажей перешедших на новый уровень:
 * поднять уровень, пересчитать атаку и защиту, вылечить
 *
 * @param team объект класса Team
 */
export function levelUpCharacters(team) {
  for (const posCharacter of team.members) {
    const { character } = posCharacter;
    character.level += 1;
    calcAttackDefence(character);
    character.health += 80;
    if (character.health > 100) character.health = 100;
  }
}

// Так как загруженные объекты персонажей из localstorage больше не являются наследниками Character,
// то необходимо пересоздать их, наследуя от Character, чтобы не возникало ошибки при
// создании объектов от PositionedCharacter
export function recreateCharacters(team) {
  const chConstructors = {
    Swordsman, Bowman, Magician, Vampire, Undead, Daemon,
  };
  const recreatedCharacters = [];
  for (const posCharacter of team.members) {
    let { character } = posCharacter;
    const constructorName = character.type[0].toUpperCase() + character.type.slice(1);
    character = new (chConstructors[constructorName])(character);
    recreatedCharacters.push(new PositionedCharacter(character, posCharacter.position));
  }
  return recreatedCharacters;
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function calcScores(gameState) {
  let sumOfHealth = 0;
  for (const posCharacter of gameState.userTeam.members) {
    const { character } = posCharacter;
    sumOfHealth += character.health;
  }
  const scores = gameState.scores + sumOfHealth;
  const maxScores = Math.max(gameState.maxScores, scores);
  // eslint-disable-next-line no-console
  console.log(`Current scores: ${scores}, Max scores: ${maxScores}`);
  return { scores, maxScores };
}
