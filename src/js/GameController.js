/* eslint-disable no-console,max-len */
import themes from './themes';
import cursors from './cursors';
import GameState from './GameState';
import { levelUpCharacters, recreateCharacters, calcScores } from './utils';
import UserActions from './UserActions';

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
    // TODO: load saved stated from stateService
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));

    this.gamePlay.drawUi(this.currentTheme);

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  generateInitialState() {
    if (this.gameState.level > 1) levelUpCharacters(this.gameState.userTeam);
    let characterCount = 2; // Количество генерируемых персонажей для пользователя
    if (this.gameState.level === 2) characterCount = 1;
    else if (this.gameState.level > 4) characterCount = Math.min(7 - this.gameState.userTeam.members.length, 2);

    this.gameState.userTeam.createTeam('user', this.gameState.level, characterCount, this.gamePlay.boardSize);
    this.gameState.botTeam.createTeam('bot', this.gameState.level, this.gameState.userTeam.members.length, this.gamePlay.boardSize);
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
    this.generateInitialState();
    this.redrawBoard();
    this.nextTurn();
  }

  nextTurn() {
    this.selectedCharacter = null;
    console.log('gameState', this.gameState);
    this.gamePlay.redrawPositions([...this.gameState.userTeam.members, ...this.gameState.botTeam.members]);
    if (this.gameState.currentPlayer === 'bot') {
      console.log('Действия бота...');
      // Действия бота

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

  onLoadGameClick() {
    const state = this.stateService.load();
    if (state) {
      if (this.gameState) state.maxScores = Math.max(state.maxScores, this.gameState.maxScores);
      this.gameState = new GameState(state);
      this.gameState.userTeam.members = recreateCharacters(this.gameState.userTeam);
      this.gameState.botTeam.members = recreateCharacters(this.gameState.botTeam);
      this.redrawBoard();
      this.nextTurn();
    } else console.log('Нет сохраненной игры');
  }

  async onCellClick(index) {
    if (this.isAnimation.value) return;
    if (this.gameState) {
      if (this.gameState.currentPlayer !== 'user') return;
      const userActions = new UserActions(this.gamePlay, this.gameState, this.selectedCharacter);
      let posCharacter = this.gameState.userTeam.members.find((el) => el.position === index);
      if (posCharacter) {
        // Реакция на клик по персонажу пользователя
        console.log('Click on user character: ', posCharacter);
        this.selectedCharacter = userActions.onUserCellClick(posCharacter);
        return;
      }
      posCharacter = this.gameState.botTeam.members.find((el) => el.position === index);
      if (posCharacter) {
        // Реакция на клик по персонажу бота
        console.log('Click on bot character: ', posCharacter);
        const damage = userActions.onBotCellClick(posCharacter);
        if (damage) {
          // Если персонаж бота был атакован
          this.isAnimation.value = true;
          await this.gamePlay.showDamage(posCharacter.position, damage);
          this.isAnimation.value = false;
          this.gamePlay.deselectCell(this.selectedCharacter.position);
          this.gamePlay.deselectCell(index);
          this.gamePlay.setCursor(cursors.auto);
          if (this.gameState.botTeam.members.length === 0) {
            // Если у бота не осталось персонажей
            const { scores, maxScores } = calcScores(this.gameState);
            this.gameState.scores = scores;
            this.gameState.maxScores = maxScores;
            this.gameState.level += 1;
            this.generateInitialState();
            this.redrawBoard();
          } else this.gameState.currentPlayer = 'bot';
          this.nextTurn();
        }
        return;
      }
      // Реакция на клик по пустой ячейке
      const isNextTurn = userActions.onEmptyCellClick(index);
      if (isNextTurn) this.nextTurn();
    }
  }

  onCellEnter(index) {
    if (this.gameState) {
      const userActions = new UserActions(this.gamePlay, this.gameState, this.selectedCharacter);
      let posCharacter = this.gameState.userTeam.members.find((el) => el.position === index);
      if (posCharacter) {
        // Если навели курсор на персонажа пользователя
        this.gamePlay.showCellTooltip(index, posCharacter);
        this.gamePlay.setCursor(cursors.pointer);
        return;
      }
      posCharacter = this.gameState.botTeam.members.find((el) => el.position === index);
      if (posCharacter) {
        // Если навели курсор на персонажа бота
        this.gamePlay.showCellTooltip(index, posCharacter);
        userActions.onBotCellEnter(index);
        return;
      }
      // Если навели курсор на пустую ячейку
      userActions.onEmptyCellEnter(index);
    }
  }

  onCellLeave(index) {
    if (this.gameState) {
      const userCharacter = this.gameState.userTeam.members.find((el) => el.position === index);
      const botCharacter = this.gameState.botTeam.members.find((el) => el.position === index);
      if (!userCharacter) this.gamePlay.deselectCell(index);
      if (userCharacter || botCharacter) this.gamePlay.hideCellTooltip();
    }
  }
}
