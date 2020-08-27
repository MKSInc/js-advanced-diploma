export default class Character {
  constructor({ level = 1, type = 'generic', health = 100 } = {}) {
    if (new.target.name === 'Character') throw new Error('Нельзя создавать экземпляры класса Character!');
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = health;
    this.type = type;
    this.movementRange = 0;
    this.attackRange = 0;
  }
}
