export default class Character {
  constructor({ level = 1, type = 'generic', health = 100 } = {}) {
    if (new.target === Character) throw new Error('Нельзя создавать экземпляры класса Character!');
    this.level = level;
    this.health = health;
    this.type = type;
  }
}
