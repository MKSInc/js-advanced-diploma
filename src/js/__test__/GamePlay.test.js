import GamePlay from '../GamePlay';
import { Bowman } from '../CharacterTypes';
import PositionedCharacter from '../PositionedCharacter';

const gamePlay = new GamePlay();

const cellEl = document.createElement('div');
gamePlay.cells.push(cellEl);

const bowman = new Bowman();
const posBowman = new PositionedCharacter(bowman, 0);

describe('showCellTooltip() hint element:', () => {
  let hintEl;
  beforeEach(() => {
    gamePlay.showCellTooltip(0, posBowman);
    hintEl = cellEl.getElementsByClassName('hint');
  });

  test('should be created', () => {
    expect(hintEl.length).toBe(1);
  });

  test('should be contain four img tags', () => {
    const imgEls = hintEl[0].getElementsByTagName('img');
    expect(imgEls.length).toBe(4);
  });

  test.each([
    ['level', '1'],
    ['attack', '25'],
    ['defence', '30'],
    ['health', '100'],
  ])('should be contain a tag with the class \'%s\', the text of which should be \'%s\'', (statName, statValue) => {
    const stat = hintEl[0].getElementsByClassName(statName);
    expect(stat.length).toBe(1);
    expect(stat[0].textContent).toBe(statValue);
  });
});
