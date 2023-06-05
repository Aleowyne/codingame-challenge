class Cell {
  constructor(index, richness, neighbors) {
    this.index = index
    this.richness = richness
    this.neighbors = neighbors
  }
}

class Tree {
  constructor(cell, size, isMine, isDormant) {
    this.cell = cell
    this.size = size
    this.isMine = isMine
    this.isDormant = isDormant
  }
}

const WAIT = 'WAIT'
const SEED = 'SEED'
const GROW = 'GROW'
const COMPLETE = 'COMPLETE'

class Action {
  constructor(type, targetCellIdx, sourceCellIdx) {
    this.type = type
    this.targetCellIdx = targetCellIdx
    this.sourceCellIdx = sourceCellIdx
  }

  static parse(line) {
    const parts = line.split(' ')
    if (parts[0] === WAIT) {
      return new Action(WAIT)
    }

    if (parts[1] === SEED) {
      return new Action(SEED, parseInt(parts[2]), parseInt(parts[1]))
    }

    return new Action(parts[0], parseInt(parts[1]))
  }

  toString() {
    if (this.type === WAIT) {
      return WAIT
    }

    if (this.type === SEED) {
      return `${SEED} ${this.sourceCellIdx} ${this.targetCellIdx}`
    }

    return `${this.type} ${this.targetCellIdx}`
  }
}

class Game {
  constructor() {
    this.round = 0
    this.nutrients = 0
    this.cells = []
    this.possibleActions = []
    this.trees = []
    this.mySun = 0
    this.myScore = 0
    this.opponentsSun = 0
    this.opponentScore = 0
    this.opponentIsWaiting = 0
    this.nbTree1 = 0;
    this.nbTree2 = 0;
    this.nbTree3 = 0;
  }

  getCell(index) {
    return this.cells.find(cell => cell.index === index);
  }

  setNbTreeBySize() {
    this.trees.forEach(tree => {
      switch (tree.size) {
        case 1:
          this.nbTree1++;
          break;
        case 2:
          this.nbTree2++;
          break;
        case 3:
          this.nbTree3++;
          break;
        default:
          break;
      };
    });
  }

  /**
   * Tri des arbres par Taille (>) et par Nutriments (>)
   */
  sortSizeNutrientsTree() {
    this.trees.sort((tree1, tree2) => {
      if (tree1.size === tree2.size) {
        return tree2.cell.richness - tree1.cell.richness;
      }
      return (tree1.size < tree2.size) ? 1 : -1;
    });

    this.trees.forEach(tree => {
      console.error(tree.size + " " + tree.cell.richness);
    });
  }

  /**
   * Récupération de nos arbres
   */
  getMineTree() {
    this.trees = this.trees.filter(tree => tree.isMine);
  }

  /**
   * Récupération de la prochaine action
   */
  getNextAction() {
    // GROW cellIdx | SEED sourceIdx targetIdx | COMPLETE cellIdx | WAIT <message>
    // Si plus d'arbres à nous, ni de points de soleil, au dodo
    if (this.trees.length === 0 || this.mySun === 0) {
      this.possibleActions.push(`WAIT dodo`);
      return this.possibleActions[0];
    }

    // Récupération de l'arbre dont il faut s'occuper
    let tree = this.trees.find(tree => {
      if ((tree.size === 3 && this.mySun >= tree.size)
        || (tree.size === 2 && this.mySun >= 7 + this.nbTree3)
        || (tree.size === 1 && this.mySun >= 3 + this.nbTree2)) {
        return tree;
      }
    });

    if (tree === undefined) {
      this.possibleActions.push(`WAIT dodo`);
      return this.possibleActions[0];
    }

    switch (tree.size) {
      case 0:
      case 1:
      case 2:
        this.possibleActions.push(`GROW ${tree.cell.index}`);
        break;

      case 3:
        this.possibleActions.push(`COMPLETE ${tree.cell.index}`);
        break;

      default:
        this.possibleActions.push(`WAIT dodo`);
        break;
    }

    return this.possibleActions[0];
  }
}

const game = new Game()

const numberOfCells = parseInt(readline());

for (let i = 0; i < numberOfCells; i++) {
  var inputs = readline().split(' ');
  const index = parseInt(inputs[0]);
  const richness = parseInt(inputs[1]);
  const neigh0 = parseInt(inputs[2]);
  const neigh1 = parseInt(inputs[3]);
  const neigh2 = parseInt(inputs[4]);
  const neigh3 = parseInt(inputs[5]);
  const neigh4 = parseInt(inputs[6]);
  const neigh5 = parseInt(inputs[7]);

  game.cells.push(
    new Cell(index, richness, [neigh0, neigh1, neigh2, neigh3, neigh4, neigh5])
  )
}


while (true) {
  game.day = parseInt(readline());
  game.nutrients = parseInt(readline());

  var inputs = readline().split(' ');
  game.mySun = parseInt(inputs[0]);
  game.myScore = parseInt(inputs[1]);

  var inputs = readline().split(' ');
  game.opponentSun = parseInt(inputs[0]);
  game.opponentScore = parseInt(inputs[1]);
  game.opponentIsWaiting = inputs[2] !== '0';
  game.trees = []

  const numberOfTrees = parseInt(readline());

  for (let i = 0; i < numberOfTrees; i++) {
    var inputs = readline().split(' ');
    const cellIndex = parseInt(inputs[0]);
    const size = parseInt(inputs[1]);
    const isMine = inputs[2] !== '0';
    const isDormant = inputs[3] !== '0';

    game.trees.push(
      new Tree(game.getCell(cellIndex), size, isMine, isDormant)
    )
  }

  game.possibleActions = []

  const numberOfPossibleAction = parseInt(readline());
  for (let i = 0; i < numberOfPossibleAction; i++) {
    const possibleAction = readline();
    //game.possibleActions.push(Action.parse(possibleAction))
  }

  game.getMineTree();
  game.sortSizeNutrientsTree();
  game.setNbTreeBySize();

  const action = game.getNextAction()
  console.log(action.toString());
}