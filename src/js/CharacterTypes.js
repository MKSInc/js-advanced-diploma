// eslint-disable-next-line max-classes-per-file
import Character from './Character';

export class Bowman extends Character {
  constructor(level) {
    super(level);
    this.type = 'bowman';
    this.attack = 25;
    this.defence = 25;
  }
}

export class Swordsman extends Character {
  constructor(level) {
    super(level);
    this.type = 'swordsman';
    this.attack = 40;
    this.defence = 10;
  }
}

export class Magician extends Character {
  constructor(level) {
    super(level);
    this.type = 'magician';
    this.attack = 10;
    this.defence = 40;
  }
}

export class Vampire extends Character {
  constructor(level) {
    super(level);
    this.type = 'vampire';
    this.attack = 25;
    this.defence = 25;
  }
}

export class Undead extends Character {
  constructor(level) {
    super(level);
    this.type = 'undead';
    this.attack = 40;
    this.defence = 10;
  }
}

export class Daemon extends Character {
  constructor(level) {
    super(level);
    this.type = 'daemon';
    this.attack = 10;
    this.defence = 40;
  }
}
