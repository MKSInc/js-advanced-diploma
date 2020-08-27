/* eslint-disable class-methods-use-this,no-unused-vars,no-console,max-len */
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import { Bowman, Daemon, Magician, Swordsman, Undead, Vampire } from './CharacterTypes';
import generateRandomPositions from './generateRandomPositions';
import GameState from './GameState';
import GamePlay from './GamePlay';
import cursors from './cursors';
import { convertIndexToCoordinates, calcAttackDefence, calcCharacterStats } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentTheme = themes.prairie;
    this.gameState = null;
    this.selectedCharacter = null;
    this.isAnimation = { value: false };
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.drawUi(this.currentTheme);

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  // Для персонажей перешедших на новый уровень:
  // поднять уровень, пересчитать атаку и защиту в соответствии с оставшимся здоровьем, вылечить
  levelUpCharacters() {
    for (const posCharacter of this.gameState.positionedCharacters) {
      const { character } = posCharacter;
      character.level += 1;
      character.attack = calcAttackDefence(character.attack, character.health);
      character.defence = calcAttackDefence(character.defence, character.health);
      character.health += 80;
      if (character.health > 100) character.health = 100;
    }
  }

  calcScores() {
    let sumOfHealth = 0;
    for (const posCharacter of this.gameState.positionedCharacters) {
      const { character } = posCharacter;
      sumOfHealth += character.health;
    }
    this.gameState.scores += sumOfHealth;
    this.gameState.maxScores = Math.max(this.gameState.maxScores, this.gameState.scores);
    console.log(`Current scores: ${this.gameState.scores}, Max scores: ${this.gameState.maxScores}`);
  }

  generateInitialState() {
    const allowedTypes = [Bowman, Swordsman];
    let userMaxLevel = 1; // Максимальный уровень персонажей пользователя
    let botMaxLevel = 1; // Максимальный уровень персонажей бота
    if (this.gameState.level > 1) {
      allowedTypes.push(Magician);
      userMaxLevel = this.gameState.level - 1;
      botMaxLevel = this.gameState.level;
      this.levelUpCharacters();
      // update character stats();
    }
    let characterCount = 2; // Количество генерируемых персонажей для пользователя
    if (this.gameState.level === 2) characterCount = 1;
    else if (this.gameState.level > 4) characterCount = Math.min(7 - this.gameState.positionedCharacters.length, 2);
    const userTeam = generateTeam(allowedTypes, userMaxLevel, characterCount);
    userTeam.forEach((character) => { this.gameState.userTeam.push(character.type); });
    calcCharacterStats(userTeam);
    this.gameState.positionedCharacters.forEach((el) => userTeam.push(el.character));

    const teamCharacterCount = userTeam.length; // Итоговое количество персонажей в команде
    const botTeam = generateTeam([Vampire, Undead, Daemon], botMaxLevel, teamCharacterCount);
    botTeam.forEach((character) => { this.gameState.botTeam.push(character.type); });
    calcCharacterStats(botTeam);

    const userPositions = generateRandomPositions(teamCharacterCount, 'user', this.gamePlay.boardSize);
    const botPositions = generateRandomPositions(teamCharacterCount, 'bot', this.gamePlay.boardSize);
    this.gameState.positionedCharacters = [];
    for (let i = 0; i < teamCharacterCount; i += 1) {
      this.gameState.positionedCharacters.push(new PositionedCharacter(userTeam[i], userPositions[i]));
      this.gameState.positionedCharacters.push(new PositionedCharacter(botTeam[i], botPositions[i]));
    }
  }

  // Перерисовывает игровое поле, если текущая тема не соответствует уровню
  redrawBoard() {
    let theme = '';
    switch (this.gameState.level) {
      case 1: theme = themes.prairie; break;
      case 2: theme = themes.desert; break;
      case 3: theme = themes.arctic; break;
      case 4: theme = themes.mountain; break;
      default: theme = themes.mountain; break;
    }
    if (this.currentTheme !== theme) {
      this.currentTheme = theme;
      this.gamePlay.drawUi(this.currentTheme);
    } else if (this.selectedCharacter) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.selectedCharacter = null;
    }
  }

  onNewGameClick() {
    if (this.gameState) {
      const { maxScores } = this.gameState;
      this.gameState = new GameState({ maxScores });
    } else this.gameState = new GameState();
    console.log(this.gameState);
    this.generateInitialState();
    this.redrawBoard();
    this.nextTurn();
  }

  nextTurn() {
    // this.gameState.currentPlayer = this.gameState.currentPlayer === 'user' ? 'bot' : 'user';
    this.selectedCharacter = null;
    console.log('gameState', this.gameState);
    this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
    if (this.gameState.currentPlayer === 'bot') {
      // Действия бота
      console.log('Действия бота...');
      this.gameState.currentPlayer = 'user';
      this.nextTurn();
    }
  }

  onSaveGameClick() {
    if (this.gameState) {
      if (this.gameState.currentPlayer !== 'user') return;
      this.stateService.save(this.gameState);
    }
  }

  // Так как загруженные объекты персонажей из localstorage больше не являются наследниками Character,
  // то необходимо пересоздать их, наследуя от Character, чтобы не возникало ошибки при
  // создании объектов от PositionedCharacter
  recreateCharacters() {
    const chConstructors = {
      Swordsman, Bowman, Magician, Vampire, Undead, Daemon,
    };
    const recreatedCharacters = [];
    for (const posCharacter of this.gameState.positionedCharacters) {
      let { character } = posCharacter;
      const constructorName = character.type[0].toUpperCase() + character.type.slice(1);
      character = new (chConstructors[constructorName])(character);
      recreatedCharacters.push(new PositionedCharacter(character, posCharacter.position));
    }
    this.gameState.positionedCharacters = recreatedCharacters;
  }

  onLoadGameClick() {
    const state = this.stateService.load();
    if (state) {
      if (this.gameState) state.maxScores = Math.max(state.maxScores, this.gameState.maxScores);
      this.gameState = new GameState(state);
      this.recreateCharacters();
      this.redrawBoard();
      this.nextTurn();
    } else console.log('Нет сохраненной игры');
  }

  async onCellClick(index) {
    // TODO: react to click
    console.log('this', this);
    if (this.isAnimation.value) return;
    if (this.gameState) {
      if (this.gameState.currentPlayer !== 'user') return;
      const posCharacter = this.gameState.positionedCharacters.find((el) => el.position === index);
      // Если нажали на персонажа
      if (posCharacter) {
        const { character } = posCharacter;
        // Если персонаж не пренадлежит пользователю
        if (!this.gameState.userTeam.includes(character.type)) {
          // Если персонаж пользователя не выбран
          if (!this.selectedCharacter) {
            GamePlay.showError('Этот персонаж пренадлежит противнику');
            return;
          // Если персонаж пользователя выбран
          } else {
            // Если ячейка не нахадится в радиусе атаки персонажа
            if (!this.checkDistance(index, 'attack')) {
              GamePlay.showError('Недопустимый радиус атаки');
              return;
            }
            // Если ячейка находится в радиусе атаки персонажа
            const { character: attacker } = this.selectedCharacter;
            const minDamage = parseFloat((attacker.attack * 0.1).toFixed(1));
            const damage = Math.max(attacker.attack - character.defence, minDamage);
            character.health -= damage;
            if (character.health <= 0) {
              let delCharacterIndex = this.gameState.positionedCharacters
                .findIndex((el) => el.position === posCharacter.position);
              this.gameState.positionedCharacters.splice(delCharacterIndex, 1);
              delCharacterIndex = this.gameState.botTeam.findIndex((el) => el === character.type);
              this.gameState.botTeam.splice(delCharacterIndex, 1);
            } else character.health = parseFloat(character.health.toFixed(1));
            console.log(damage);
            this.isAnimation.value = true;
            await this.gamePlay.showDamage(index, damage);
            this.isAnimation.value = false;
            this.gamePlay.deselectCell(this.selectedCharacter.position);
            this.gamePlay.deselectCell(index);
            if (this.gameState.botTeam.length === 0) {
              this.calcScores();
              this.gameState.level += 1;
              this.generateInitialState();
              this.redrawBoard();
            } else this.gameState.currentPlayer = 'bot';
            this.nextTurn();
          }
        // Если персонаж пренадлежит пользователю
        } else {
          // Если уже есть выбранный персонаж
          if (this.selectedCharacter) {
            // Если нажали на уже выбранного персонажа
            if (this.selectedCharacter.position === posCharacter.position) return;
            // Если нажатый персонаж не соответствует ранее выбранному,
            // то убрать выделение с ранее выбранного персонажа
            this.gamePlay.deselectCell(this.selectedCharacter.position);
          }
          this.selectedCharacter = posCharacter;
          this.gamePlay.selectCell(posCharacter.position);
        }
      // Если нажали на пустую ячейку
      } else {
        // Если персонаж пользователя не выбран
        if (!this.selectedCharacter) return;
        // Если персонаж пользователя выбран
        // Если ячейка не находится в радиусе передвижения персонажа
        if (!this.checkDistance(index, 'move')) {
          GamePlay.showError('Недопустимый радиус передвижения');
          return;
        }
        // Если ячейка находится в радиусе передвижения персонажа
        this.gamePlay.deselectCell(this.selectedCharacter.position);
        this.gamePlay.deselectCell(index);
        this.selectedCharacter.position = index;
        console.log(this.selectedCharacter);
        console.log(this.gameState);
        this.gameState.currentPlayer = 'bot';
        this.nextTurn();
        return;
      }
    }
  }

  checkDistance(index, action) {
    const start = { ...convertIndexToCoordinates(this.selectedCharacter.position, this.gamePlay.boardSize) };
    const end = { ...convertIndexToCoordinates(index, this.gamePlay.boardSize) };
    const actionRange = action === 'move' ? 'movementRange' : 'attackRange';
    return (Math.abs(start.x - end.x) <= this.selectedCharacter.character[actionRange])
      && (Math.abs(start.y - end.y) <= this.selectedCharacter.character[actionRange]);
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.gameState) {
      const posCharacter = this.gameState.positionedCharacters.find((el) => el.position === index);
      // Если навели курсор на персонажа
      if (posCharacter) {
        const { character } = posCharacter;
        console.log(character);
        this.gamePlay.showCellTooltip(`
        Lvl: ${character.level}, Att: ${character.attack}, Def: ${character.defence}, HP: ${character.health}, (${index})`, index);
        // Если персонаж пренадлежит пользователю
        if (this.gameState.userTeam.includes(character.type)) {
          this.gamePlay.setCursor(cursors.pointer);
        // Если персонаж пренадлежит боту
        } else {
          // Если персонаж пользователя не выбран
          if (!this.selectedCharacter) return;
          // Если персонаж пользователя выбран
          // Если персонаж бота находится в радиусе атаки
          if (this.checkDistance(index, 'attack')) {
            this.gamePlay.selectCell(index, 'red');
            this.gamePlay.setCursor(cursors.crosshair);
            return;
          }
          // Если персонаж бота не находится в радиусе атаки
          this.gamePlay.setCursor(cursors.notallowed);
          return;
        }
      // Если навели курсор на пустую ячейку
      } else {
        // Если нет ранее выбранного персонажа
        if (!this.selectedCharacter) {
          this.gamePlay.setCursor(cursors.auto);
          return;
        }
        // Если персонаж выбран
        // Если ячейка находится в радиусе передвижения персонажа
        if (this.checkDistance(index, 'move')) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
        } else this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.gameState) {
      this.gamePlay.hideCellTooltip(index);
      const posCharacter = this.gameState.positionedCharacters.find((el) => el.position === index);
      if (!posCharacter) this.gamePlay.deselectCell(index);
      else if (this.gameState.botTeam.includes(posCharacter.character.type)) this.gamePlay.deselectCell(index);
    }
  }
}
