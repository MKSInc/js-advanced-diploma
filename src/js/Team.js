// eslint-disable-next-line object-curly-newline
import { Bowman, Daemon, Swordsman, Undead, Vampire, Magician } from './CharacterTypes';
import { generateTeam } from './generators';
import generateRandomPositions from './utils';
import PositionedCharacter from './PositionedCharacter';

export default class Team {
  constructor(members) {
    this.members = members;
  }

  createTeam(team, gameLevel, characterCount, boardSize) {
    let allowedTypes = [];
    let characterMaxLevel = gameLevel;
    let characters = [];
    if (team === 'user') {
      allowedTypes = [Bowman, Swordsman];
      if (gameLevel > 1) {
        characterMaxLevel = gameLevel - 1;
        allowedTypes.push(Magician);
        for (const posCharacter of this.members) {
          characters.push(posCharacter.character);
        }
      }
    } else if (team === 'bot') {
      allowedTypes = [Vampire, Undead, Daemon];
      characterMaxLevel = gameLevel + 1;
    }

    characters = [...characters, ...generateTeam(allowedTypes, characterMaxLevel, characterCount)];
    const charactersPositions = generateRandomPositions(characters.length, team, boardSize);
    this.members = [];
    for (let i = 0; i < characters.length; i += 1) {
      this.members.push(new PositionedCharacter(characters[i], charactersPositions[i]));
    }
  }

  deleteMember(member) {
    this.members = this.members.filter((el) => el !== member);
  }
}
