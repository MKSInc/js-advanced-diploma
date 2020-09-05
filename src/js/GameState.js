/* eslint-disable no-unused-vars */
import Team from './Team';

export default class GameState {
  constructor({
    level = 1,
    currentPlayer = 'user',
    userTeam = { members: [] },
    botTeam = { members: [] },
    scores = 0, maxScores = 0,
  } = {}) {
    this.level = level;
    this.currentPlayer = currentPlayer;
    this.userTeam = new Team(userTeam.members);
    this.botTeam = new Team(botTeam.members);
    this.scores = scores;
    this.maxScores = maxScores;
  }

  static from(object) {
    // TODO: create object
    return null;
  }
}
