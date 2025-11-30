const axios = require("axios");
const DirectNavigation = require("./algorithms/direct");
const SpiralSearch = require("./algorithms/spiral");
const AStarNavigation = require("./algorithms/astar");
const {
  calculerDistanceGPS,
  calculerCapGPS,
  gpsVersCartesien,
  cartesienVersGPS,
} = require("./utils/gpsUtils");

// Configuration des services
const MOTOR_SERVICE_URL =
  process.env.MOTOR_SERVICE_URL || "http://motor-service:3007";
const LIDAR_SERVICE_URL =
  process.env.LIDAR_SERVICE_URL || "http://lidar-service:3005";
const GYRO_SERVICE_URL =
  process.env.GYRO_SERVICE_URL || "http://gyro-service:3004";
const GPS_SERVICE_URL =
  process.env.GPS_SERVICE_URL || "http://gps-service:3006";

// Configuration de la navigation
const NAVIGATION_CONFIG = {
  distanceMinObstacle: 50, // distance minimale en mètres avant d'éviter un obstacle
  vitesseNormale: 5, // vitesse normale (1-9)
  vitesseLente: 3, // vitesse lente pour les manœuvres précises
  angleRotation: 45, // angle de rotation en degrés
  distanceSecurite: 100, // distance de sécurité en mètres
  angleSeuil: 10, // angle minimum pour déclencher une rotation
  rayonMax: 200, // rayon maximum pour la recherche en spirale (mètres)
  pasRayon: 20, // pas d'augmentation du rayon pour la spirale (mètres)
  distanceSeuil: 10, // distance minimale pour considérer un point atteint (mètres)
};

// Map des commandes
const commandMap = {
  forward: "F",
  backward: "B",
  left: "L",
  right: "R",
  stop: "S",
};

const commandesValides = Object.values(commandMap);

// État de navigation
let etatNavigation = {
  position: { latitude: 0, longitude: 0 },
  orientation: 0, // angle en degrés
  destination: null,
  enMouvement: false,
  obstacleDetecte: false,
  algorithmeActuel: null,
  trajectoire: null,
  pointReference: null, // Point de référence pour les calculs cartésiens
};

// Initialisation des algorithmes
const algorithmes = {
  direct: new DirectNavigation(NAVIGATION_CONFIG),
  spiral: new SpiralSearch(NAVIGATION_CONFIG),
  astar: new AStarNavigation(NAVIGATION_CONFIG),
};

// Fonction principale de navigation
async function naviguer(direction) {
  const cmd = commandMap[direction];
  if (!cmd || !commandesValides.includes(cmd)) {
    throw new Error("Commande invalide : " + direction);
  }

  try {
    // Vérifier les obstacles avant de se déplacer
    const obstacles = await verifierObstacles();
    if (obstacles.proche) {
      await eviterObstacle(obstacles);
      return;
    }

    // Envoyer la commande au service moteur
    await axios.post(`${MOTOR_SERVICE_URL}/motors/command`, { cmd });
    console.log(`[NAVIGATION-SVC] Commande ${cmd} envoyée`);

    // Mettre à jour l'état de navigation
    await mettreAJourPosition(direction);
  } catch (err) {
    console.error(
      `[NAVIGATION-SVC] Erreur communication avec motor-service :`,
      err.message
    );
    throw new Error("Erreur communication avec motor-service");
  }
}

// Navigation vers un point GPS avec un algorithme spécifique
async function naviguerVersPoint(destinationGPS, typeAlgorithme = "direct") {
  if (!algorithmes[typeAlgorithme]) {
    throw new Error(`Algorithme non supporté : ${typeAlgorithme}`);
  }

  // Initialiser le point de référence si nécessaire
  if (!etatNavigation.pointReference) {
    etatNavigation.pointReference = etatNavigation.position;
  }

  // Convertir les coordonnées GPS en coordonnées cartésiennes locales
  const destinationCartesien = gpsVersCartesien(
    etatNavigation.pointReference,
    destinationGPS
  );

  etatNavigation.destination = destinationGPS;
  etatNavigation.enMouvement = true;
  etatNavigation.algorithmeActuel = typeAlgorithme;

  try {
    // Calculer la trajectoire
    const obstacles = await obtenirObstacles();
    etatNavigation.trajectoire = await algorithmes[
      typeAlgorithme
    ].calculerTrajectoire(
      gpsVersCartesien(etatNavigation.pointReference, etatNavigation.position),
      destinationCartesien,
      obstacles.map((obs) =>
        gpsVersCartesien(etatNavigation.pointReference, obs)
      )
    );

    // Suivre la trajectoire
    while (etatNavigation.enMouvement) {
      const positionCartesien = gpsVersCartesien(
        etatNavigation.pointReference,
        etatNavigation.position
      );

      const action = await algorithmes[typeAlgorithme].suivreTrajectoire(
        positionCartesien,
        etatNavigation.orientation,
        etatNavigation.trajectoire
      );

      if (action === "stop") {
        etatNavigation.enMouvement = false;
        break;
      }

      await naviguer(action);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } catch (err) {
    console.error(
      "[NAVIGATION-SVC] Erreur navigation vers point:",
      err.message
    );
    etatNavigation.enMouvement = false;
    throw err;
  }
}

// Vérifier les obstacles avec le LIDAR
async function verifierObstacles() {
  try {
    const response = await axios.get(`${LIDAR_SERVICE_URL}/lidar`);
    const { distance, strength } = response.data;

    return {
      proche: distance < NAVIGATION_CONFIG.distanceMinObstacle,
      distance,
      strength,
    };
  } catch (err) {
    console.error("[NAVIGATION-SVC] Erreur lecture LIDAR:", err.message);
    return { proche: true, distance: 0, strength: 0 };
  }
}

// Obtenir tous les obstacles connus
async function obtenirObstacles() {
  try {
    const response = await axios.get(`${LIDAR_SERVICE_URL}/lidar/obstacles`);
    return response.data.obstacles || [];
  } catch (err) {
    console.error("[NAVIGATION-SVC] Erreur lecture obstacles:", err.message);
    return [];
  }
}

// Éviter un obstacle détecté
async function eviterObstacle(obstacle) {
  console.log("[NAVIGATION-SVC] Obstacle détecté, manœuvre d'évitement");

  // Arrêter d'abord
  await axios.post(`${MOTOR_SERVICE_URL}/motors/command`, { cmd: "S" });

  // Déterminer la meilleure direction d'évitement
  const gyroData = await getGyroData();
  const angleActuel = gyroData.gyro.z;

  // Choisir la direction avec le plus d'espace
  const angleGauche = angleActuel - NAVIGATION_CONFIG.angleRotation;
  const angleDroite = angleActuel + NAVIGATION_CONFIG.angleRotation;

  // Tourner dans la direction choisie
  await axios.post(`${MOTOR_SERVICE_URL}/motors/command`, { cmd: "L" });

  // Attendre la rotation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Avancer lentement
  await axios.post(`${MOTOR_SERVICE_URL}/motors/command`, { cmd: "F" });
}

// Obtenir les données du gyroscope
async function getGyroData() {
  try {
    const response = await axios.get(`${GYRO_SERVICE_URL}/gyro`);
    return response.data;
  } catch (err) {
    console.error("[NAVIGATION-SVC] Erreur lecture gyroscope:", err.message);
    return { gyro: { x: 0, y: 0, z: 0 } };
  }
}

// Obtenir la position GPS actuelle
async function getPositionGPS() {
  try {
    const response = await axios.get(`${GPS_SERVICE_URL}/gps`);
    return response.data;
  } catch (err) {
    console.error("[NAVIGATION-SVC] Erreur lecture GPS:", err.message);
    throw new Error("Impossible d'obtenir la position GPS");
  }
}

// Mettre à jour la position estimée
async function mettreAJourPosition(direction) {
  const distance = 10; // distance estimée parcourue en mètres
  const capRad = (etatNavigation.orientation * Math.PI) / 180;

  // Obtenir la position GPS actuelle
  const positionGPS = await getPositionGPS();
  etatNavigation.position = positionGPS;
}

// Obtenir l'état actuel de la navigation
function getEtatNavigation() {
  return { ...etatNavigation };
}

module.exports = {
  naviguer,
  naviguerVersPoint,
  getEtatNavigation,
};
