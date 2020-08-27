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
