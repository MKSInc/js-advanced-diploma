import Character from '../Character';

class Bowman extends Character {
}

test('An error should be thrown when creating an instance of the Character class', () => {
  expect(() => new Character(1)).toThrow();
});

test('An error should not be thrown when creating an instance of an inheritance from the Character class', () => {
  expect(() => new Bowman(1)).not.toThrow();
  expect(new Bowman(1).level).toBe(1);
});
