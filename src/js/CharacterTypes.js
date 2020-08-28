/* eslint-disable object-curly-newline */
// eslint-disable-next-line max-classes-per-file
import Character from './Character';

export class Bowman extends Character {
  constructor({ level, attack = 25, defence = 25, health } = {}) {
    super({ level, type: 'bowman', health });
    this.attack = attack;
    this.defence = defence;
    this.movementRange = 2;
    this.attackRange = 2;
  }
}

export class Swordsman extends Character {
  constructor({ level, attack = 40, defence = 10, health } = {}) {
    super({ level, type: 'swordsman', health });
    this.attack = attack;
    this.defence = defence;
    this.movementRange = 4;
    this.attackRange = 1;
  }
}

export class Magician extends Character {
  constructor({ level, attack = 10, defence = 40, health } = {}) {
    super({ level, type: 'magician', health });
    this.attack = attack;
    this.defence = defence;
    this.movementRange = 1;
    this.attackRange = 4;
  }
}

export class Vampire extends Character {
  constructor({ level, attack = 25, defence = 25, health } = {}) {
    super({ level, type: 'vampire', health });
    this.attack = attack;
    this.defence = defence;
    this.movementRange = 2;
    this.attackRange = 2;
  }
}

export class Undead extends Character {
  constructor({ level, attack = 40, defence = 10, health } = {}) {
    super({ level, type: 'undead', health });
    this.attack = attack;
    this.defence = defence;
    this.movementRange = 4;
    this.attackRange = 1;
  }
}

export class Daemon extends Character {
  constructor({ level, attack = 10, defence = 40, health } = {}) {
    super({ level, type: 'daemon', health });
    this.attack = attack;
    this.defence = defence;
    this.movementRange = 1;
    this.attackRange = 4;
  }
}
