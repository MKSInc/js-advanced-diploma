/* eslint-disable max-len */
import cursors from './cursors';
import { checkDistance } from './utils';
import GamePlay from './GamePlay';

export default class UserActions {
  constructor(gamePlay, gameState, selectedCharacter) {
    this.gamePlay = gamePlay;
    this.gameState = gameState;
    this.selectedCharacter = selectedCharacter;
  }

  onEmptyCellEnter(index) {
    if (!this.selectedCharacter) {
      this.gamePlay.setCursor(cursors.auto);
      return;
    }
    if (checkDistance(index, this.selectedCharacter, 'move', this.gamePlay.boardSize)) {
      // Если ячейка находится в радиусе передвижения персонажа
      this.gamePlay.selectCell(index, 'green');
      this.gamePlay.setCursor(cursors.pointer);
    } else this.gamePlay.setCursor(cursors.notallowed);
  }

  onBotCellEnter(index) {
    if (!this.selectedCharacter) return;
    if (checkDistance(index, this.selectedCharacter, 'attack', this.gamePlay.boardSize)) {
      // Если персонаж бота находится в радиусе атаки
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor(cursors.crosshair);
      return;
    }
    // Если персонаж бота не находится в радиусе атаки
    this.gamePlay.setCursor(cursors.notallowed);
  }

  /**
   * Выполняет действия при нажатии на ячейку с персонажем пользователя
   *
   * @param posCharacter - объект класса PositionedCharacter, персонаж, на которого нажали
   * @returns boolean, false - если выбранный персонаж не поменялся, в противном случае
   * возвращает объект с новым выбранным персонажем
   */
  onUserCellClick(posCharacter) {
    if (this.selectedCharacter) {
      if (posCharacter.position === this.selectedCharacter.position) return posCharacter;
      this.gamePlay.deselectCell(this.selectedCharacter.position);
    }
    this.gamePlay.selectCell(posCharacter.position);
    return posCharacter;
  }

  /**
   * Выполняет действия при нажатии на пустую ячейку
   *
   * @param index - индекс нажатой ячейки
   * @returns boolean, true - если нужно передать ход, в противном случае - false
   */
  onEmptyCellClick(index) {
    if (!this.selectedCharacter) return false;
    // Если ячейка не находится в радиусе передвижения персонажа
    if (!checkDistance(index, this.selectedCharacter, 'move', this.gamePlay.boardSize)) {
      GamePlay.showError('Недопустимый радиус передвижения');
      return false;
    }
    // Если ячейка находится в радиусе передвижения персонажа
    this.gamePlay.deselectCell(this.selectedCharacter.position);
    this.gamePlay.deselectCell(index);
    this.selectedCharacter.position = index;
    this.gameState.currentPlayer = 'bot';
    return true;
  }

  /**
   * Выполняет действия при нажатии на ячейку c персонажем бота
   *
   * @param posCharacter - объект класса PositionedCharacter, персонаж, на которого нажали
   * @returns number, damage - урон нанесенный персонажу, если атаки не было - возвращает 0
   */
  onBotCellClick(posCharacter) {
    if (!this.selectedCharacter) {
      GamePlay.showError('Этот персонаж пренадлежит противнику');
      return 0;
    }
    if (!checkDistance(posCharacter.position, this.selectedCharacter, 'attack', this.gamePlay.boardSize)) {
      // Если ячейка не нахадится в радиусе атаки персонажа
      GamePlay.showError('Недопустимый радиус атаки');
      return 0;
    }
    // Если ячейка находится в радиусе атаки персонажа
    const { character: attacker } = this.selectedCharacter;
    const { character: target } = posCharacter;
    const minDamage = parseFloat((attacker.attack * 0.1).toFixed(1));
    const damage = Math.max(attacker.attack - target.defence, minDamage);

    target.health -= damage;
    if (target.health <= 0) {
      // Удаляем уничтоженного персонажа из команды
      this.gameState.botTeam.members = this.gameState.botTeam.members.filter((el) => el !== posCharacter);
    } else target.health = parseFloat(target.health.toFixed(1));
    return damage;
  }
}
