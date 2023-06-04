class Cell {
  constructor(index, type, resources, neighbors, myAnts = 0, oppAnts = 0) {
    this.index = index;
    this.type = type;
    this.resources = resources;
    this.neighbors = neighbors;
    this.myAnts = myAnts;
    this.oppAnts = oppAnts;
    this.cellIndexesByDistance = [];
  }
}

class Game {
  constructor() {
    this.eggCellsRound = [];
    this.crystalCellsRound = [];
    this.myBaseIndexes = [];
    this.oppBaseIndexes = [];
    this.nbInitialEggs = 0;
    this.nbInitialCrystals = 0;
    this.nbCrystalsRound = 0;
    this.myScore = 0;
    this.oppScore = 0;
    this.myAnts = 0;
    this.actions = [];

    this.nbCells = parseInt(readline());
    this.cells = this.generateGrid();

    this.nbBases = parseInt(readline());
    let inputs = readline().split(' ');

    for (let i = 0; i < this.nbBases; i++) {
      this.myBaseIndexes.push(parseInt(inputs[i]));
    }

    inputs = readline().split(' ');
    for (let i = 0; i < this.nbBases; i++) {
      this.oppBaseIndexes.push(parseInt(inputs[i]));
    }
  }

  generateGrid() {
    const cells = [];

    for (let i = 0; i < this.nbCells; i++) {
      let inputs = readline().split(' ');
      const type = parseInt(inputs[0]);
      const initialResources = parseInt(inputs[1]);
      const neigh0 = parseInt(inputs[2]);
      const neigh1 = parseInt(inputs[3]);
      const neigh2 = parseInt(inputs[4]);
      const neigh3 = parseInt(inputs[5]);
      const neigh4 = parseInt(inputs[6]);
      const neigh5 = parseInt(inputs[7]);

      const cell = new Cell(
        i,
        type,
        initialResources,
        [neigh0, neigh1, neigh2, neigh3, neigh4, neigh5].filter(id => id !== -1)
      );

      cells.push(cell);

      if (type === 1) {
        this.nbInitialEggs += initialResources;
      }
      else if (type === 2) {
        this.nbInitialCrystals += initialResources;
      }
    }

    return cells;
  }


  // A partir de plusieurs cellules, détermination des cellules voisines avec des ressources
  determineNeighCellsWithResources(indexes, visitedCells) {
    let neighIndexWithResources = [];
    let indexesToChecked = [];

    indexes.forEach(index => {
      this.cells[index].neighbors.forEach(neighIndex => {
        // Si la cellule n'a pas encore été visitée
        if (!visitedCells.has(neighIndex)) {
          if (this.cells[neighIndex].resources > 0) {
            neighIndexWithResources.push(neighIndex);
          }

          visitedCells.add(neighIndex);
          indexesToChecked.push(neighIndex);
        }
      });
    });

    return [neighIndexWithResources, indexesToChecked, visitedCells];
  }


  // A partir d'une cellule, calcul de la distance avec les autres cellules
  calculateDistanceFromCellToOtherCells(index) {
    let cellIndexesByDistance = [];
    cellIndexesByDistance[0] = [];

    let visitedCells = new Set();
    let indexesToChecked = [index];
    let neighIndexWithResources = [];
    let distance = 1;

    do {
      [neighIndexWithResources, indexesToChecked, visitedCells] = this.determineNeighCellsWithResources(indexesToChecked, visitedCells);
      cellIndexesByDistance[distance] = neighIndexWithResources;
      distance++;
    } while (indexesToChecked.length !== 0);

    return cellIndexesByDistance;
  }


  // Récupération de la distance entre deux cellules
  getDistanceBetweenCells(fromIndex, toIndex) {
    let distance = 0;

    for (let cellIndexes of this.cells[fromIndex].cellIndexesByDistance) {
      if (cellIndexes.includes(toIndex)) {
        return distance;
      }

      distance += 1;
    }
  }


  // Récupération de l'index d'une cellule parmi les cellules visitées qui est la plus proche de la cellule à atteindre
  getBestStartLink(linkedCellIndexes, endCellIndex) {
    let minDistance = 0;
    let minDistanceIndex = -1;

    for (let linkedCellIndex of linkedCellIndexes) {
      let distance = this.getDistanceBetweenCells(linkedCellIndex, endCellIndex);

      if (minDistance === 0 || distance < minDistance) {
        minDistance = distance;
        minDistanceIndex = linkedCellIndex;
      }
    }

    return minDistanceIndex;
  }


  loop() {
    this.actions = [];
    this.nbCrystalsRound = 0;
    this.myAnts = 0;

    let inputs = readline().split(' ');
    this.myScore = parseInt(inputs[0]);
    this.oppScore = parseInt(inputs[1]);

    for (let i = 0; i < this.nbCells; i++) {
      let inputs = readline().split(' ');
      const resources = parseInt(inputs[0]);
      const myAnts = parseInt(inputs[1]);
      const oppAnts = parseInt(inputs[2]);

      this.cells[i].resources = resources;
      this.cells[i].myAnts = myAnts;
      this.cells[i].oppAnts = oppAnts;

      if (resources === 0) {
        this.cells[i].type = 0;
      }

      if (this.cells[i].type === 2) {
        this.nbCrystalsRound += resources;
      }

      this.myAnts += myAnts;
    }

    for (let i = 0; i < this.nbCells; i++) {
      this.cells[i].cellIndexesByDistance = this.calculateDistanceFromCellToOtherCells(i);
    }

    for (let myBaseIndex of this.myBaseIndexes) {
      this.cells[myBaseIndex].cellIndexesByDistance = this.calculateDistanceFromCellToOtherCells(myBaseIndex);
    }

    this.eggCellsRound = this.cells.filter(cell => cell.type === 1);
    this.crystalCellsRound = this.cells.filter(cell => cell.type === 2);
  }
}


const game = new Game();
let nbEggCellsToTake = 0;
let nbCrystalCellsToTake = 0;
let visitedEggCells = [];
let firstRound = true;
let takeAllCrystals = false;

while (true) {
  game.loop();

  if (firstRound) {
    nbEggCellsToTake = game.eggCellsRound.length <= 2 ? game.eggCellsRound.length : Math.ceil(game.eggCellsRound.length / 2);
  }
  else {
    if (visitedEggCells.length !== 0) {
      visitedEggCells = visitedEggCells.filter(cellIndex => game.cells[cellIndex].resources !== 0);
      nbEggCellsToTake = visitedEggCells.length;
    }
  }

  visitedEggCells = [];

  let visitedCells = game.myBaseIndexes.slice();
  let nbEggsLeftToTakeEarly = 0;

  // Recherche des oeufs à une distance max de 2 cases des bases
  for (let distance = 1; distance <= 2; distance++) {
    for (let myBaseIndex of game.myBaseIndexes) {
      let cellIndexesByDistanceFromBase = game.cells[myBaseIndex].cellIndexesByDistance;

      cellIndexesByDistanceFromBase[distance].forEach(cellIndex => {
        if (!visitedCells.includes(cellIndex) && game.cells[cellIndex].type === 1) {
          let bestCellStart = game.getBestStartLink(visitedCells, cellIndex);
          const action = `LINE ${bestCellStart} ${cellIndex} 1`;
          game.actions.push(action);

          visitedCells.push(cellIndex);
          nbEggsLeftToTakeEarly += game.cells[cellIndex].resources;
        }
      });
    }
  }

  if (firstRound) {
    nbEggCellsToTake -= game.actions.length;
  }

  if (game.actions.length !== 0) {
    const action = `MESSAGE EGGS EARLY`;
    game.actions.push(action);
  }


  // Recherche des oeufs au-delà de 2 cases des bases
  if (nbEggCellsToTake > 0 && (game.actions.length === 0 || nbEggsLeftToTakeEarly < 10 * game.myBaseIndexes.length)) {
    let distance = 3;
    let searchEgg = true;
    nbEggsLeftToTakeEarly = 0;

    while (searchEgg) {
      searchEgg = false;

      for (let myBaseIndex of game.myBaseIndexes) {
        let cellIndexesByDistanceFromBase = game.cells[myBaseIndex].cellIndexesByDistance;

        if (cellIndexesByDistanceFromBase.length > distance) {
          searchEgg = cellIndexesByDistanceFromBase[distance].every(cellIndex => {
            if (visitedEggCells.length >= nbEggCellsToTake) {
              return false;
            }

            if (!visitedCells.includes(cellIndex) && game.cells[cellIndex].type === 1) {
              let bestCellStart = game.getBestStartLink(visitedCells, cellIndex);
              const action = `LINE ${bestCellStart} ${cellIndex} 1`;
              game.actions.push(action);

              visitedCells.push(cellIndex);
              visitedEggCells.push(cellIndex);
              nbEggsLeftToTakeEarly += game.cells[cellIndex].resources;
            }

            return true;
          });

          if (!searchEgg) {
            break;
          }
        }
      }

      distance++;
    }

    if (visitedEggCells.length !== 0) {
      const action = `MESSAGE EGGS`;
      game.actions.push(action);
    }
  }


  // Recherche des cristaux
  if (game.actions.length === 0
    || game.myScore >= 0.15 * Math.ceil(game.nbInitialCrystals / 2)
    || game.oppScore >= 0.15 * Math.ceil(game.nbInitialCrystals / 2)) {

    let nbCellsCrystalsToGo = 0;
    let searchCrystal = true;
    let distance = 1;

    if (!takeAllCrystals) {
      if (game.myAnts >= Math.ceil(game.nbCrystalsRound / 2) - game.myScore) {
        nbCrystalCellsToTake = Math.ceil(game.crystalCellsRound.length / 2);
      }
      else {
        nbCrystalCellsToTake = game.crystalCellsRound.length;
        takeAllCrystals = true;
      }
    }

    while (searchCrystal) {
      searchCrystal = false;

      for (let myBaseIndex of game.myBaseIndexes) {
        let cellIndexesByDistanceFromBase = game.cells[myBaseIndex].cellIndexesByDistance;

        if (cellIndexesByDistanceFromBase.length > distance) {
          searchCrystal = cellIndexesByDistanceFromBase[distance].every(cellIndex => {
            if (nbCellsCrystalsToGo >= nbCrystalCellsToTake) {
              return false;
            }

            if (!visitedCells.includes(cellIndex) && game.cells[cellIndex].type === 2) {
              let bestCellStart = game.getBestStartLink(visitedCells, cellIndex);
              const action = `LINE ${bestCellStart} ${cellIndex} 1`;
              game.actions.push(action);

              visitedCells.push(cellIndex);
              nbCellsCrystalsToGo++;
            }

            return true;
          });

          if (!searchCrystal) {
            break;
          }
        }
      }

      distance++;
    }

    if (nbCellsCrystalsToGo !== 0) {
      const action = `MESSAGE CRYSTALS`;
      game.actions.push(action);
    }
  }

  firstRound = false;

  // WAIT | LINE <sourceIdx> <targetIdx> <strength> | BEACON <cellIdx> <strength> | MESSAGE <text>
  if (game.actions.length === 0) {
    console.log('WAIT');
  } else {
    console.log(game.actions.join(';'))
  }
}