const { calculerDistance, calculerAngle, normaliserAngle } = require('../utils/mathUtils');

class SpiralSearch {
  constructor(config) {
    this.config = config;
    this.rayonActuel = 0;
    this.angleActuel = 0;
    this.pasAngulaire = 30; // degrés
  }

  async calculerTrajectoire(positionActuelle, destination) {
    const distance = calculerDistance(positionActuelle, destination);
    this.rayonActuel = Math.min(distance / 2, this.config.rayonMax);
    this.angleActuel = 0;

    const points = [];
    for (let angle = 0; angle < 360; angle += this.pasAngulaire) {
      const x = positionActuelle.x + this.rayonActuel * Math.cos(angle * Math.PI / 180);
      const y = positionActuelle.y + this.rayonActuel * Math.sin(angle * Math.PI / 180);
      points.push({ x, y });
    }

    return {
      distance,
      type: 'spiral',
      points,
      rayon: this.rayonActuel
    };
  }

  async suivreTrajectoire(positionActuelle, orientation, trajectoire) {
    if (this.angleActuel >= 360) {
      this.rayonActuel += this.config.pasRayon;
      this.angleActuel = 0;
    }

    const pointCible = trajectoire.points[Math.floor(this.angleActuel / this.pasAngulaire)];
    const angle = calculerAngle(positionActuelle, pointCible);
    const differenceAngle = normaliserAngle(angle - orientation);

    this.angleActuel += this.pasAngulaire;

    if (Math.abs(differenceAngle) > this.config.angleSeuil) {
      return differenceAngle > 0 ? 'right' : 'left';
    }

    return 'forward';
  }
}

module.exports = SpiralSearch;
