/* eslint-disable object-curly-newline */
// eslint-disable-next-line max-classes-per-file
import Character from './Character';

export class Bowman extends Character {
  constructor({ level, attack, defence, health } = {}) {
    super({ level, type: 'bowman', health });
    this.baseAttack = 25;
    this.baseDefence = 30;
    this.attack = attack || this.baseAttack;
    this.defence = defence || this.baseDefence;
    this.maxAttack = 50;
    this.maxDefence = 66;
    this.movementRange = 2;
    this.attackRange = 2;
  }
}

export class Swordsman extends Character {
  constructor({ level, attack, defence, health } = {}) {
    super({ level, type: 'swordsman', health });
    this.baseAttack = 40;
    this.baseDefence = 20;
    this.attack = attack || this.baseAttack;
    this.defence = defence || this.baseDefence;
    this.maxAttack = 100;
    this.maxDefence = 50;
    this.movementRange = 4;
    this.attackRange = 1;
  }
}

export class Magician extends Character {
  constructor({ level, attack, defence, health } = {}) {
    super({ level, type: 'magician', health });
    this.baseAttack = 15;
    this.baseDefence = 40;
    this.attack = attack || this.baseAttack;
    this.defence = defence || this.baseDefence;
    this.maxAttack = 33;
    this.maxDefence = 80;
    this.movementRange = 1;
    this.attackRange = 4;
  }
}

export class Vampire extends Character {
  constructor({ level, attack, defence, health } = {}) {
    super({ level, type: 'vampire', health });
    this.baseAttack = 25;
    this.baseDefence = 30;
    this.attack = attack || this.baseAttack;
    this.defence = defence || this.baseDefence;
    this.maxAttack = 50;
    this.maxDefence = 66;
    this.movementRange = 2;
    this.attackRange = 2;
  }
}

export class Undead extends Character {
  constructor({ level, attack, defence, health } = {}) {
    super({ level, type: 'undead', health });
    this.baseAttack = 40;
    this.baseDefence = 20;
    this.attack = attack || this.baseAttack;
    this.defence = defence || this.baseDefence;
    this.maxAttack = 100;
    this.maxDefence = 50;
    this.movementRange = 4;
    this.attackRange = 1;
  }
}

export class Daemon extends Character {
  constructor({ level, attack, defence, health } = {}) {
    super({ level, type: 'daemon', health });
    this.baseAttack = 15;
    this.baseDefence = 40;
    this.attack = attack || this.baseAttack;
    this.defence = defence || this.baseDefence;
    this.maxAttack = 33;
    this.maxDefence = 80;
    this.movementRange = 1;
    this.attackRange = 4;
  }
}
