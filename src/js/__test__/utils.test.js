import { calcTileType, calcHealthLevel } from '../utils';

describe('The calcTileType() function should return the tile type according to its location', () => {
  test('should return \'top-left\'', () => {
    expect(calcTileType(0, 8)).toBe('top-left');
  });

  test('should return \'top\'', () => {
    expect(calcTileType(1, 8)).toBe('top');
  });

  test('should return \'top-right\'', () => {
    expect(calcTileType(7, 8)).toBe('top-right');
    expect(calcTileType(9, 10)).toBe('top-right');
  });

  test('should return \'left\'', () => {
    expect(calcTileType(8, 8)).toBe('left');
    expect(calcTileType(10, 10)).toBe('left');
  });

  test('should return \'right\'', () => {
    expect(calcTileType(15, 8)).toBe('right');
    expect(calcTileType(19, 10)).toBe('right');
  });

  test('should return \'bottom-left\'', () => {
    expect(calcTileType(56, 8)).toBe('bottom-left');
    expect(calcTileType(90, 10)).toBe('bottom-left');
  });

  test('should return \'bottom-right\'', () => {
    expect(calcTileType(63, 8)).toBe('bottom-right');
    expect(calcTileType(99, 10)).toBe('bottom-right');
  });

  test('should return \'bottom\'', () => {
    expect(calcTileType(57, 8)).toBe('bottom');
    expect(calcTileType(91, 10)).toBe('bottom');
  });

  test('should return \'center\'', () => {
    expect(calcTileType(9, 8)).toBe('center');
    expect(calcTileType(11, 10)).toBe('center');
  });
});

describe('The calcHealthLevel() function', () => {
  test('should return \'critical\'', () => {
    expect(calcHealthLevel(0)).toBe('critical');
    expect(calcHealthLevel(14)).toBe('critical');
  });

  test('should return \'normal\'', () => {
    expect(calcHealthLevel(15)).toBe('normal');
    expect(calcHealthLevel(16)).toBe('normal');
    expect(calcHealthLevel(49)).toBe('normal');
  });

  test('should return \'high\'', () => {
    expect(calcHealthLevel(50)).toBe('high');
    expect(calcHealthLevel(51)).toBe('high');
  });
});
