import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';
import GameState from '../GameState';
import PositionedCharacter from '../PositionedCharacter';
import { Bowman, Daemon } from '../CharacterTypes';

const gamePlay = new GamePlay();
const gameContainerEl = document.createElement('div');
gamePlay.bindToDOM(gameContainerEl);

const mockLoad = jest.fn();
jest.mock('../GameStateService',
  () => jest.fn().mockImplementation(() => ({ load: mockLoad })));

const stateService = new GameStateService(localStorage);

const gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init();

gameCtrl.isGameRunning = true;
gameCtrl.gameState = new GameState();
const bowman = new Bowman();
const posBowman = new PositionedCharacter(bowman, 0);
gameCtrl.gameState.userTeam.members.push(posBowman);

const daemon = new Daemon();
const posDaemon = new PositionedCharacter(daemon, 1);
gameCtrl.gameState.botTeam.members.push(posDaemon);

gameCtrl.redrawBoard();
gameCtrl.gamePlay.redrawPositions([posBowman, posDaemon]);

describe('onCellEnter:', () => {
  describe('when hovering over a cell with a user character:', () => {
    beforeAll(() => {
      gameCtrl.onCellEnter(0);
    });

    test('the cursor should be a \'pointer\'', () => {
      expect(gamePlay.boardEl.style.cursor).toBe('pointer');
    });

    test('cell is not highlighted', () => {
      const isHighlighted = gamePlay.cells[0].classList.contains('selected');
      expect(isHighlighted).toBeFalsy();
    });
  });

  describe('when hovering over a cell with a bot character:', () => {
    test('user character not selected, the cursor should be a \'auto\'', () => {
      gameCtrl.selectedCharacter = null;
      gameCtrl.gameState.botTeam.members[0].position = 1;
      gameCtrl.onCellEnter(1);
      expect(gamePlay.boardEl.style.cursor).toBe('auto');
    });

    describe('user character selected, bot character in attack radius:', () => {
      beforeAll(() => {
        gameCtrl.selectedCharacter = posBowman;
        gameCtrl.gameState.botTeam.members[0].position = 1;
        gameCtrl.onCellEnter(1);
      });

      test('the cursor should be a \'crosshair\'', () => {
        expect(gamePlay.boardEl.style.cursor).toBe('crosshair');
      });

      test('the cell should be highlighted in red', () => {
        const isRed = gamePlay.cells[1].classList.contains('selected-red');
        expect(isRed).toBeTruthy();
      });
    });

    test('user character selected, bot character is not in attack radius, the cursor should be a \'not-allowed\'', () => {
      gameCtrl.selectedCharacter = posBowman;
      gameCtrl.gameState.botTeam.members[0].position = 3;
      gameCtrl.onCellEnter(3);
      expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
    });
  });

  describe('when hovering over an empty cell:', () => {
    test('user character not selected, the cursor should be a \'auto\'', () => {
      gameCtrl.selectedCharacter = null;
      gameCtrl.gameState.botTeam.members[0].position = 3;
      gameCtrl.onCellEnter(2);
      expect(gamePlay.boardEl.style.cursor).toBe('auto');
    });

    describe('user character selected, empty cell in the move radius: ', () => {
      beforeAll(() => {
        gameCtrl.selectedCharacter = posBowman;
        gameCtrl.gameState.botTeam.members[0].position = 3;
        gameCtrl.onCellEnter(2);
      });

      test('the cursor should be a \'pointer\'', () => {
        expect(gamePlay.boardEl.style.cursor).toBe('pointer');
      });

      test('an empty cell should be highlighted in green', () => {
        const isGreen = gamePlay.cells[2].classList.contains('selected-green');
        expect(isGreen).toBeTruthy();
      });
    });

    test('user character selected, empty cell is not in move radius, the cursor should be a \'not-allowed\'', () => {
      gameCtrl.selectedCharacter = posBowman;
      gameCtrl.onCellEnter(4);
      expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
    });
  });
});

const mockAlert = jest.fn();
window.alert = mockAlert;

describe('onLoadGameClick:', () => {
  beforeEach(() => {
    mockLoad.mockClear();
    mockAlert.mockClear();
  });

  test('There should be no error message when loading data successfully', () => {
    mockLoad.mockReturnValue({});
    gameCtrl.onLoadGameClick();
    expect(mockLoad).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
  });

  test('If the data is not loaded successfully, there should be an error message', () => {
    mockLoad.mockReturnValue(undefined);
    gameCtrl.onLoadGameClick();
    expect(mockLoad).toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalled();
  });
});
