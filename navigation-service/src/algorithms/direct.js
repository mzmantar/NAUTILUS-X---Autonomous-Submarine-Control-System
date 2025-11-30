const { calculerDistance, calculerAngle, normaliserAngle } = require('../utils/mathUtils');

class DirectNavigation {
  constructor(config) {
    this.config = config;
  }

  async calculerTrajectoire(positionActuelle, destination) {
    const distance = calculerDistance(positionActuelle, destination);
    const angle = calculerAngle(positionActuelle, destination);
    
    return {
      distance,
      angle,
      type: 'direct',
      points: [positionActuelle, destination]
    };
  }

  async suivreTrajectoire(positionActuelle, orientation, trajectoire) {
    const differenceAngle = normaliserAngle(trajectoire.angle - orientation);
    
    if (Math.abs(differenceAngle) > this.config.angleSeuil) {
      return differenceAngle > 0 ? 'right' : 'left';
    }
    
    return 'forward';
  }
}

module.exports = DirectNavigation;
