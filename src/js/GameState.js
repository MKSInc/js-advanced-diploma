/* eslint-disable class-methods-use-this,no-unused-vars */
export default class GameState {
  constructor({
    level = 1, currentPlayer = 'user', userTeam = [], botTeam = [], positionedCharacters = [],
    scores = 0, maxScores = 0,
  } = {}) {
    this.level = level;
    this.currentPlayer = currentPlayer;
    this.userTeam = userTeam;
    this.botTeam = botTeam;
    this.positionedCharacters = positionedCharacters;
    this.scores = scores;
    this.maxScores = maxScores;
  }

  static from(object) {
    // TODO: create object
    return null;
  }
}
