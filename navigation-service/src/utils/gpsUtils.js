// Constantes pour les calculs GPS
const RAYON_TERRE = 6371000; // Rayon de la Terre en mètres

// Convertir des degrés en radians
function degToRad(deg) {
  return deg * (Math.PI / 180);
}

// Convertir des radians en degrés
function radToDeg(rad) {
  return rad * (180 / Math.PI);
}

// Calculer la distance entre deux points GPS (en mètres)
function calculerDistanceGPS(point1, point2) {
  const lat1 = degToRad(point1.latitude);
  const lon1 = degToRad(point1.longitude);
  const lat2 = degToRad(point2.latitude);
  const lon2 = degToRad(point2.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return RAYON_TERRE * c;
}

// Calculer le cap entre deux points GPS (en degrés)
function calculerCapGPS(point1, point2) {
  const lat1 = degToRad(point1.latitude);
  const lon1 = degToRad(point1.longitude);
  const lat2 = degToRad(point2.latitude);
  const lon2 = degToRad(point2.longitude);

  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let cap = Math.atan2(y, x);
  cap = radToDeg(cap);
  return (cap + 360) % 360;
}

// Convertir une distance en mètres en décalage GPS approximatif
function metresVersGPS(latitude, longitude, distanceMetres, capDegres) {
  const capRad = degToRad(capDegres);
  const latRad = degToRad(latitude);
  
  const dLat = distanceMetres * Math.cos(capRad) / RAYON_TERRE;
  const dLon = distanceMetres * Math.sin(capRad) / (RAYON_TERRE * Math.cos(latRad));
  
  return {
    latitude: latitude + radToDeg(dLat),
    longitude: longitude + radToDeg(dLon)
  };
}

// Convertir des coordonnées GPS en coordonnées cartésiennes locales (en mètres)
function gpsVersCartesien(reference, point) {
  const distance = calculerDistanceGPS(reference, point);
  const cap = calculerCapGPS(reference, point);
  
  return {
    x: distance * Math.cos(degToRad(cap)),
    y: distance * Math.sin(degToRad(cap))
  };
}

// Convertir des coordonnées cartésiennes locales en coordonnées GPS
function cartesienVersGPS(reference, point) {
  const distance = Math.sqrt(point.x * point.x + point.y * point.y);
  const cap = radToDeg(Math.atan2(point.y, point.x));
  
  return metresVersGPS(reference.latitude, reference.longitude, distance, cap);
}

module.exports = {
  calculerDistanceGPS,
  calculerCapGPS,
  metresVersGPS,
  gpsVersCartesien,
  cartesienVersGPS
}; 