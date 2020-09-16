/* eslint-disable max-len */
// eslint-disable-next-line object-curly-newline
import { calcDamage, checkDistance, convertIndexToCoordinates, makeDamage } from './utils';

/**
 * Поведение бота:
 * Атаковать персонажа пользователя с минимальной защитой персонажем бота с максимальной атакой
 *
 * Последовательность действий для реальзации этого поведения:
 * 1. Найти персонажей с мимнимальной защитой в команде пользователя;
 * 2. Найти персонажей с максимальной атакой в команде бота;
 * 3. Если среди найденных персонажей есть персонаж пользователя в радиусе атаки персонажа бота, то атаковать;
 * 4. Если нет, пределить пару с персонажами атакующий-цель, между которыми будет наименьшее расстояние;
 * 5. Если таких пар несколько, выбрать из них случайную;
 * 6. Определить ячейку для перемещения, чтобы приблизится к цели на расстояние атаки;
 */
export default class BotAction {
  constructor(gamePlay, gameState) {
    this.gamePlay = gamePlay;
    this.userTeam = gameState.userTeam;
    this.userMembers = gameState.userTeam.members;
    this.botMembers = gameState.botTeam.members;
    this.target = undefined;
    this.attacker = undefined;
    this.action = null;
  }

  // Возвращает пару атакующий-цель, в которой цель находится в радиусе атаки,
  // если такой пары нет, возвращает null
  getPairWithAttackAction(targets, attackers) {
    for (const target of targets) {
      for (const attacker of attackers) {
        if (checkDistance(target.position, attacker, 'attack', this.gamePlay.boardSize)) {
          return { target, attacker };
        }
      }
    }
    return null;
  }

  // Возвращает радиус, в котором находится цель от атакующего
  getDistanceBetweenCharacters(target, attacker) {
    const { x: x1, y: y1 } = convertIndexToCoordinates(target.position, this.gamePlay.boardSize);
    const { x: x2, y: y2 } = convertIndexToCoordinates(attacker.position, this.gamePlay.boardSize);
    const x = Math.abs(x1 - x2);
    const y = Math.abs(y1 - y2);
    return Math.max(x, y);
  }

  // Возвращает пару атакующий-цель с наименьшим радиусом между ними
  getPairWithMoveAction(targets, attackers) {
    const distanceBetweenCharacters = [];
    let minDistance;
    for (const target of targets) {
      for (const attacker of attackers) {
        const distance = this.getDistanceBetweenCharacters(target, attacker);
        distanceBetweenCharacters.push({ target, attacker, distance });
        if (minDistance === undefined) minDistance = distance;
        else if (minDistance > distance) minDistance = distance;
      }
    }
    return distanceBetweenCharacters.find((el) => el.distance === minDistance);
  }

  // Возвращает массив персонажей пользователя с минимальной защитой
  getCharactersWithMinDefence() {
    const defenceValues = [];
    for (const { character } of this.userMembers) defenceValues.push(character.defence);
    const minDefence = Math.min(...defenceValues);
    return this.userMembers.filter(({ character }) => character.defence === minDefence);
  }

  // Возвращает массив персонажей бота с максимальной атакой
  getCharactersWithMaxAttack() {
    const attackValues = [];
    for (const { character } of this.botMembers) attackValues.push(character.attack);
    const maxAttack = Math.max(...attackValues);
    return this.botMembers.filter(({ character }) => character.attack === maxAttack);
  }

  // Возвращает пару атакующий-цель и действие по отношению к цели
  getPairAndAction() {
    const targets = this.getCharactersWithMinDefence();
    const attackers = this.getCharactersWithMaxAttack();
    const pairWithAttackAction = this.getPairWithAttackAction(targets, attackers);
    if (pairWithAttackAction) {
      return { pair: pairWithAttackAction, action: 'attack' };
    }
    const pairWithMoveAction = this.getPairWithMoveAction(targets, attackers);
    return { pair: pairWithMoveAction, action: 'move' };
  }

  // Записывает в свойства объекта полученные данные: цель, атакующий, действие по отношению к цели
  setPairAndAction() {
    const pairAndAction = this.getPairAndAction();
    this.target = pairAndAction.pair.target;
    this.attacker = pairAndAction.pair.attacker;
    this.action = pairAndAction.action;
  }

  // Наносит вычесленный урон.
  // Цепочка промисов для атаки:
  // 1. ждет, выделяет атакующего
  // 2. ждет, выделяет цель
  // 3. ждет, запускает анимацию урона, снимает выделения
  // 4. ... продолжение цепочки в GameController
  attackTarget() {
    const damage = calcDamage(this.attacker.character, this.target.character);

    makeDamage(damage, this.target, this.userTeam);
    return new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.selectCell(this.attacker.position);
        resolve();
      }, 300);
    }).then(() => new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.selectCell(this.target.position, 'red');
        resolve();
      }, 300);
    })).then(() => new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.showDamage(this.target.position, damage);
        this.gamePlay.deselectCell(this.target.position);
        this.gamePlay.deselectCell(this.attacker.position);
        resolve();
      }, 300);
    }));
  }

  convertCoordinatesToIndex(coordinates) {
    const { x, y } = coordinates;
    return y * this.gamePlay.boardSize + x;
  }

  // Получить минимальное расстояние
  // eslint-disable-next-line class-methods-use-this
  getMinDistances(cellsRangeAndDistances) {
    let minDistance;
    for (const { distance } of cellsRangeAndDistances) {
      if (minDistance === undefined) minDistance = distance;
      if (minDistance > distance) minDistance = distance;
    }
    return minDistance;
  }

  // Получить ближайшие ячейки от указанной позиции до цели, на которые/к которым перемещаться
  getNearestCells(cellsInAttackRadius, position) {
    const { x: x1, y: y1 } = convertIndexToCoordinates(position, this.gamePlay.boardSize);
    const cellsRangeAndDistances = [];
    for (const cell of cellsInAttackRadius) {
      const x = Math.abs(x1 - cell.x);
      const y = Math.abs(y1 - cell.y);
      const distance = Math.max(x, y);
      cellsRangeAndDistances.push({ cell, distance });
    }
    const minDistance = this.getMinDistances(cellsRangeAndDistances);
    return cellsRangeAndDistances.filter((el) => el.distance === minDistance);
  }

  // Получить случайную ячейку из списка ближайших от атакующего до цели, на которую/к которой перемещаться
  // eslint-disable-next-line class-methods-use-this
  getCellToMove(nearestCells) {
    if (nearestCells.length === 1) return nearestCells[0];
    const randomCellIndex = Math.floor(Math.random() * nearestCells.length);
    return nearestCells[randomCellIndex];
  }

  // Получить все ячейки в указанном диапазоне(range) от указанной цели(index)
  getCellsInTargetRange(range, index) {
    const { x: targetX, y: targetY } = convertIndexToCoordinates(index, this.gamePlay.boardSize);
    const x1 = (targetX - range) > 0 ? targetX - range : 0;
    const y1 = (targetY - range) > 0 ? targetY - range : 0;
    const x2 = (targetX + range) < this.gamePlay.boardSize ? targetX + range : this.gamePlay.boardSize - 1;
    const y2 = (targetY + range) < this.gamePlay.boardSize ? targetY + range : this.gamePlay.boardSize - 1;

    const cells = [];
    for (let y = y1; y <= y2; y += 1) {
      for (let x = x1; x <= x2; x += 1) {
        const cellIndex = this.convertCoordinatesToIndex({ x, y });
        const character = [...this.userMembers, ...this.botMembers].find(({ position }) => position === cellIndex);
        if (!character) cells.push({ x, y });
      }
    }
    return cells;
  }

  // Получить ближайшую ячейку, с которой можно атаковать
  getCellToAttackFrom() {
    const cellsInAttackRange = this.getCellsInTargetRange(this.attacker.character.attackRange, this.target.position);
    const nearestCells = this.getNearestCells(cellsInAttackRange, this.attacker.position);
    return this.getCellToMove(nearestCells);
  }

  getCellIndexToMove() {
    const cellToAttackFrom = this.getCellToAttackFrom();
    let cellIndexToMove = this.convertCoordinatesToIndex(cellToAttackFrom.cell);
    while (!checkDistance(cellIndexToMove, this.attacker, this.action, this.gamePlay.boardSize)) {
      // Вычислять ближайшую ячеку для перемещения, пока не найдется такая,
      // которая будет в радиусе перемещения персонажа
      const cellsInTargetRange = this.getCellsInTargetRange(this.attacker.character.movementRange, cellIndexToMove);
      const cellsToMove = [];
      for (const cell of cellsInTargetRange) {
        const cellIndex = this.convertCoordinatesToIndex(cell);
        if (checkDistance(cellIndex, this.attacker, this.action, this.gamePlay.boardSize)) cellsToMove.push(cell);
      }

      if (cellsToMove.length === 1) {
        cellIndexToMove = this.convertCoordinatesToIndex(cellsToMove[0]);
      } else if (cellsToMove.length > 1) {
        const nearestCellsToMoveCell = this.getNearestCells(cellsToMove, cellIndexToMove);
        const cellToMove = this.getCellToMove(nearestCellsToMoveCell);
        cellIndexToMove = this.convertCoordinatesToIndex(cellToMove.cell);
      } else if (cellsToMove.length === 0) {
        // Нет ячеек в радиусе перемещения
        const nearestCells = this.getNearestCells(cellsInTargetRange, this.attacker.position);
        const cellToMove = this.getCellToMove(nearestCells);
        cellIndexToMove = this.convertCoordinatesToIndex(cellToMove.cell);
      }
    }
    return cellIndexToMove;
  }

  // Перемещает персонажа на указанную ячейку.
  // Цепочка промисов для перемещения:
  // 1. ждет, выделяет персонажа
  // 2. ждет, выделяет ячеку для перемещения
  // 3. ждет, снимает выделения, перемещает персонажа
  // 4. ... продолжение цепочки в GameController
  moveToCell(cellIndex) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.selectCell(this.attacker.position);
        resolve();
      }, 300);
    }).then(() => new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.selectCell(cellIndex, 'green');
        resolve();
      }, 300);
    })).then(() => new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.deselectCell(this.attacker.position);
        this.gamePlay.deselectCell(cellIndex);
        this.attacker.position = cellIndex;
        resolve();
      }, 300);
    }));
  }
}
