export default class Character {
  constructor(level, type = 'generic') {
    if (new.target.name === 'Character') throw new Error('Нельзя создавать экземпляры класса Character!');
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 100;
    this.type = type;
  }
}
