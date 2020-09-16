/* eslint-disable max-len */
import themes from './themes';
import cursors from './cursors';
import GameState from './GameState';
import { levelUpCharacters, recreateCharacters, calcScores } from './utils';
import UserActions from './UserActions';
import BotAction from './botActions';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentTheme = themes.prairie;
    this.gameState = null;
    this.selectedCharacter = null;
    this.isGameRunning = false;
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
    let { level } = this.gameState;
    if (level > 4) level = 4;
    const themesByLevel = {
      1: themes.prairie,
      2: themes.desert,
      3: themes.arctic,
      4: themes.mountain,
    };
    const theme = themesByLevel[level];

    if (this.currentTheme !== theme) {
      this.currentTheme = theme;
      this.gamePlay.drawUi(this.currentTheme);
    } else if (this.selectedCharacter) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.selectedCharacter = null;
    }
  }

  onNewGameClick() {
    this.isGameRunning = true;
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
    this.gamePlay.redrawPositions([...this.gameState.userTeam.members, ...this.gameState.botTeam.members]);
    if (this.gameState.currentPlayer === 'bot') {
      // Действия бота
      const botAction = new BotAction(this.gamePlay, this.gameState);
      botAction.setPairAndAction();
      if (botAction.action === 'attack') {
        // Цепочка промисов для атаки:
        // 4. ... продолжение цепочки:
        //    В зависимости от исхода атаки: возвращает соответствующую задержку для следующего звена
        // 5. Если полученная задержка 0, то не ждет окончания анимации урона и передает ход пользователю
        //    Если задержка больше 0, то заканчивает игру, обновляет персонажей на поле,
        //    дает возможность анимации закончится, выводит окно с сообщением о конце игры.
        botAction.attackTarget()
          .then(() => new Promise((resolve) => {
            if (this.gameState.userTeam.members.length === 0) {
              resolve(500);
            }
            resolve(0);
          })).then((result) => {
            setTimeout(() => {
              if (result !== 0) {
                this.isGameRunning = false;
                this.gamePlay.setCursor(cursors.auto);
                this.gamePlay.redrawPositions([...this.gameState.botTeam.members]);
                setTimeout(() => GamePlay.showMessage('Игра окончена. Вы проиграли.'), 100);
              } else {
                this.gameState.currentPlayer = 'user';
                this.nextTurn();
              }
            }, result);
          });
      } else if (botAction.action === 'move') {
        const cellIndexToMove = botAction.getCellIndexToMove();
        // Цепочка промисов для перемещения:
        // 4. ... продолжение цепочки: передает ход пользователю
        botAction.moveToCell(cellIndexToMove)
          .then(() => {
            this.gameState.currentPlayer = 'user';
            this.nextTurn();
          });
      }
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

    // eslint-disable-next-line no-console
    if (!state) { GamePlay.showError('Нет сохраненной игры'); return; }
    this.isGameRunning = true;
    if (this.gameState) state.maxScores = Math.max(state.maxScores, this.gameState.maxScores);
    this.gameState = new GameState(state);
    this.gameState.userTeam.members = recreateCharacters(this.gameState.userTeam);
    this.gameState.botTeam.members = recreateCharacters(this.gameState.botTeam);
    this.redrawBoard();
    this.nextTurn();
  }

  onCellClick(index) {
    if (!this.isGameRunning) return;
    if (this.gameState.currentPlayer !== 'user') return;
    const userActions = new UserActions(this.gamePlay, this.gameState, this.selectedCharacter);
    let posCharacter = this.gameState.userTeam.members.find((el) => el.position === index);
    if (posCharacter) {
      // Реакция на клик по персонажу пользователя
      this.selectedCharacter = userActions.onUserCellClick(posCharacter);
      return;
    }
    posCharacter = this.gameState.botTeam.members.find((el) => el.position === index);
    if (posCharacter) {
      // Реакция на клик по персонажу бота
      const damage = userActions.onBotCellClick(posCharacter);
      if (damage) {
        // Если персонаж бота был атакован
        this.gamePlay.showDamage(posCharacter.position, damage);
        this.gamePlay.deselectCell(this.selectedCharacter.position);
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor(cursors.auto);
        if (this.gameState.botTeam.members.length === 0) {
          // Если у бота не осталось персонажей, переход на следующий уровень
          const { scores, maxScores } = calcScores(this.gameState);
          this.gameState.scores = scores;
          this.gameState.maxScores = maxScores;
          this.gameState.level += 1;
          this.generateInitialState();
          setTimeout(() => {
            this.redrawBoard();
            this.nextTurn();
          }, 500);
        } else {
          this.gameState.currentPlayer = 'bot';
          this.nextTurn();
        }
      }
      return;
    }
    // Реакция на клик по пустой ячейке
    const isNextTurn = userActions.onEmptyCellClick(index);
    if (isNextTurn) this.nextTurn();
  }

  onCellEnter(index) {
    if (!this.isGameRunning) return;
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

  onCellLeave(index) {
    if (!this.isGameRunning) return;
    const userCharacter = this.gameState.userTeam.members.find((el) => el.position === index);
    const botCharacter = this.gameState.botTeam.members.find((el) => el.position === index);
    if (!userCharacter) this.gamePlay.deselectCell(index);
    if (userCharacter || botCharacter) this.gamePlay.hideCellTooltip();
  }
}
