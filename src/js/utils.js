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

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

/**
 * Calculates the attack and defense of the character depending on his health
 *
 * @param statValue character attack or defence value
 * @param health character health value
 * @returns number value of character's attack or defence
 */
export function calcAttackDefence(statValue, health) {
  return Math.max(statValue, parseFloat((statValue * (1.8 - (100 - health) / 100)).toFixed()));
}
