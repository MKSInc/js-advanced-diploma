/* eslint-disable class-methods-use-this,no-unused-vars,no-console */
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import { Bowman, Swordsman, Magician } from './CharacterTypes';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);

    // Тестовая отрисовка команды
    const team = generateTeam([Bowman, Swordsman, Magician], 1, 3);
    console.log(team);
    this.gamePlay.redrawPositions([
      new PositionedCharacter(team[0], 10),
      new PositionedCharacter(team[1], 11),
      new PositionedCharacter(team[2], 12)]);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
