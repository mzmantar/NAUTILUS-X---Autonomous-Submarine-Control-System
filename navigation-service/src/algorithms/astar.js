const { calculerDistance, calculerAngle, normaliserAngle } = require('../utils/mathUtils');

class AStarNavigation {
  constructor(config) {
    this.config = config;
    this.grille = [];
    this.tailleCellule = 1; // 1 mètre par cellule
  }

  async calculerTrajectoire(positionActuelle, destination, obstacles = []) {
    // Créer la grille
    this.initialiserGrille(positionActuelle, destination, obstacles);
    
    // Trouver le chemin
    const chemin = this.trouverChemin(
      this.positionVersCellule(positionActuelle),
      this.positionVersCellule(destination)
    );

    // Convertir le chemin en points
    const points = chemin.map(cellule => this.celluleVersPosition(cellule));

    return {
      type: 'astar',
      points,
      distance: calculerDistance(positionActuelle, destination)
    };
  }

  async suivreTrajectoire(positionActuelle, orientation, trajectoire) {
    if (trajectoire.points.length === 0) return 'stop';

    const pointCible = trajectoire.points[0];
    const distance = calculerDistance(positionActuelle, pointCible);

    if (distance < this.config.distanceSeuil) {
      trajectoire.points.shift();
      return this.suivreTrajectoire(positionActuelle, orientation, trajectoire);
    }

    const angle = calculerAngle(positionActuelle, pointCible);
    const differenceAngle = normaliserAngle(angle - orientation);

    if (Math.abs(differenceAngle) > this.config.angleSeuil) {
      return differenceAngle > 0 ? 'right' : 'left';
    }

    return 'forward';
  }

  initialiserGrille(positionActuelle, destination, obstacles) {
    const minX = Math.min(positionActuelle.x, destination.x);
    const maxX = Math.max(positionActuelle.x, destination.x);
    const minY = Math.min(positionActuelle.y, destination.y);
    const maxY = Math.max(positionActuelle.y, destination.y);

    // Ajouter une marge de sécurité
    const marge = this.config.distanceSecurite;
    const largeur = Math.ceil((maxX - minX + 2 * marge) / this.tailleCellule);
    const hauteur = Math.ceil((maxY - minY + 2 * marge) / this.tailleCellule);

    this.grille = Array(hauteur).fill().map(() => Array(largeur).fill(0));
    this.offsetX = minX - marge;
    this.offsetY = minY - marge;

    // Marquer les obstacles avec une zone de sécurité
    obstacles.forEach(obstacle => {
      const cellule = this.positionVersCellule(obstacle);
      if (this.estDansGrille(cellule)) {
        // Marquer l'obstacle et sa zone de sécurité
        for (let y = -2; y <= 2; y++) {
          for (let x = -2; x <= 2; x++) {
            const celluleSecurite = {
              x: cellule.x + x,
              y: cellule.y + y
            };
            if (this.estDansGrille(celluleSecurite)) {
              this.grille[celluleSecurite.y][celluleSecurite.x] = 1;
            }
          }
        }
      }
    });
  }

  positionVersCellule(position) {
    return {
      x: Math.floor((position.x - this.offsetX) / this.tailleCellule),
      y: Math.floor((position.y - this.offsetY) / this.tailleCellule)
    };
  }

  celluleVersPosition(cellule) {
    return {
      x: (cellule.x * this.tailleCellule) + this.offsetX + (this.tailleCellule / 2),
      y: (cellule.y * this.tailleCellule) + this.offsetY + (this.tailleCellule / 2)
    };
  }

  estDansGrille(cellule) {
    return cellule.x >= 0 && cellule.x < this.grille[0].length &&
           cellule.y >= 0 && cellule.y < this.grille.length;
  }

  trouverChemin(depart, arrivee) {
    const ouvert = new Set([JSON.stringify(depart)]);
    const ferme = new Set();
    const gScore = new Map([[JSON.stringify(depart), 0]]);
    const fScore = new Map([[JSON.stringify(depart), this.heuristique(depart, arrivee)]]);
    const cameFrom = new Map();

    while (ouvert.size > 0) {
      const courant = this.trouverMeilleurNoeud(ouvert, fScore);
      const courantObj = JSON.parse(courant);

      if (courantObj.x === arrivee.x && courantObj.y === arrivee.y) {
        return this.reconstruireChemin(cameFrom, courantObj);
      }

      ouvert.delete(courant);
      ferme.add(courant);

      for (const voisin of this.getVoisins(courantObj)) {
        const voisinStr = JSON.stringify(voisin);
        if (ferme.has(voisinStr)) continue;

        const tentativeGScore = gScore.get(courant) + this.tailleCellule;

        if (!ouvert.has(voisinStr)) {
          ouvert.add(voisinStr);
        } else if (tentativeGScore >= gScore.get(voisinStr)) {
          continue;
        }

        cameFrom.set(voisinStr, courantObj);
        gScore.set(voisinStr, tentativeGScore);
        fScore.set(voisinStr, tentativeGScore + this.heuristique(voisin, arrivee));
      }
    }

    return [];
  }

  heuristique(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) * this.tailleCellule;
  }

  trouverMeilleurNoeud(ouvert, fScore) {
    let meilleur = null;
    let meilleurScore = Infinity;

    for (const noeud of ouvert) {
      const score = fScore.get(noeud);
      if (score < meilleurScore) {
        meilleur = noeud;
        meilleurScore = score;
      }
    }

    return meilleur;
  }

  getVoisins(cellule) {
    const voisins = [];
    const directions = [
      { x: 0, y: 1 }, { x: 1, y: 0 },
      { x: 0, y: -1 }, { x: -1, y: 0 },
      { x: 1, y: 1 }, { x: 1, y: -1 },
      { x: -1, y: 1 }, { x: -1, y: -1 }
    ];

    for (const dir of directions) {
      const voisin = {
        x: cellule.x + dir.x,
        y: cellule.y + dir.y
      };

      if (this.estDansGrille(voisin) && this.grille[voisin.y][voisin.x] === 0) {
        voisins.push(voisin);
      }
    }

    return voisins;
  }

  reconstruireChemin(cameFrom, courant) {
    const chemin = [courant];
    let courantStr = JSON.stringify(courant);

    while (cameFrom.has(courantStr)) {
      courant = cameFrom.get(courantStr);
      chemin.unshift(courant);
      courantStr = JSON.stringify(courant);
    }

    return chemin;
  }
}

module.exports = AStarNavigation;
