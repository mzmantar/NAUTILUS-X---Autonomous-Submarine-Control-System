import React, { useEffect, useRef, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/MapView.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibXptYW50YXIiLCJhIjoiY21jcnhuZWd3MGR0eDJqczk1ZmhsM212MCJ9.03VdZziXETbAVLajRsLmog";

const createGeoData = (position) => ({
  streetFurniture: {
    type: "FeatureCollection",
    features: [
      // Lampadaires
      {
        type: "Feature",
        properties: { type: "streetlight" },
        geometry: {
          coordinates: [position[0] + 0.0002, position[1] + 0.0001],
          type: "Point",
        },
      },
      {
        type: "Feature",
        properties: { type: "streetlight" },
        geometry: {
          coordinates: [position[0] - 0.0002, position[1] - 0.0001],
          type: "Point",
        },
      },
      // Bancs publics
      {
        type: "Feature",
        properties: { type: "bench" },
        geometry: {
          coordinates: [position[0] + 0.0001, position[1] + 0.0002],
          type: "Point",
        },
      },
      // Arrêts de bus
      {
        type: "Feature",
        properties: { type: "bus-stop" },
        geometry: {
          coordinates: [position[0] - 0.0001, position[1] + 0.0003],
          type: "Point",
        },
      },
    ],
  },
  greenSpaces: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { type: "park" },
        geometry: {
          coordinates: [
            [
              [position[0] - 0.0005, position[1] - 0.0003],
              [position[0] - 0.0002, position[1] - 0.0003],
              [position[0] - 0.0002, position[1] - 0.0001],
              [position[0] - 0.0005, position[1] - 0.0001],
              [position[0] - 0.0005, position[1] - 0.0003],
            ],
          ],
          type: "Polygon",
        },
      },
    ],
  },
  roadMarkings: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { type: "crosswalk" },
        geometry: {
          coordinates: [
            [position[0] - 0.0001, position[1]],
            [position[0] + 0.0001, position[1]],
          ],
          type: "LineString",
        },
      },
    ],
  },
  sonarCenter: {
    type: "Feature",
    properties: {},
    geometry: {
      coordinates: position,
      type: "Point",
    },
  },
  oceanCurrents: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { type: "current", speed: "2.5 nœuds" },
        geometry: {
          coordinates: [
            [position[0] - 0.002, position[1] - 0.001],
            [position[0] + 0.002, position[1] + 0.001],
          ],
          type: "LineString",
        },
      },
    ],
  },
  waterZones: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { type: "shallow-water", depth: "5-20m" },
        geometry: {
          coordinates: [
            [
              [position[0] - 0.003, position[1] - 0.002],
              [position[0] + 0.003, position[1] - 0.002],
              [position[0] + 0.003, position[1] + 0.002],
              [position[0] - 0.003, position[1] + 0.002],
              [position[0] - 0.003, position[1] - 0.002],
            ],
          ],
          type: "Polygon",
        },
      },
    ],
  },
  clipArea: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [
            [
              [position[0] - 0.0008, position[1] - 0.0008],
              [position[0] + 0.0008, position[1] - 0.0008],
              [position[0] + 0.0008, position[1] + 0.0008],
              [position[0] - 0.0008, position[1] + 0.0008],
              [position[0] - 0.0008, position[1] - 0.0008],
            ],
          ],
          type: "Polygon",
        },
      },
    ],
  },
});

// Création du HTML du marqueur sous-marin
const createSubmarineMarkerElement = () => {
  const el = document.createElement("div");
  el.className = "submarine-marker";
  el.innerHTML = `
    <div class="submarine-body">
      <div class="periscope"></div>
      <div class="main-window"></div>
      <div class="side-window-1"></div>
      <div class="side-window-2"></div>
      <div class="propeller">
        <div class="blade-horizontal"></div>
        <div class="blade-vertical"></div>
      </div>
    </div>
  `;
  return el;
};

const MapView = ({ position }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const animationFramesRef = useRef([]);

  // Données géographiques mémorisées
  const geoData = useMemo(() => createGeoData(position), [position]);

  // Configuration de la carte
  const initializeMap = useCallback(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      center: position,
      zoom: 16,
      pitch: 180,
      bearing: 60,
      attributionControl: false,
      antialias: true,
      maxZoom: 22,
    });

    // Stocker la position du sous-marin dans l'objet map pour y accéder plus tard
    map._submarinePosition = position;

    mapRef.current = map;

    return map;
  }, [position]);

  // Fonction pour ajouter les sources de données
  const addDataSources = useCallback(
    (map) => {
      map.addSource("street-furniture", {
        type: "geojson",
        data: geoData.streetFurniture,
      });
      map.addSource("green-spaces", {
        type: "geojson",
        data: geoData.greenSpaces,
      });
      map.addSource("road-markings", {
        type: "geojson",
        data: geoData.roadMarkings,
      });
      map.addSource("sonar-center", {
        type: "geojson",
        data: geoData.sonarCenter,
      });
      map.addSource("ocean-currents", {
        type: "geojson",
        data: geoData.oceanCurrents,
      });
      map.addSource("water-zones", {
        type: "geojson",
        data: geoData.waterZones,
      });
      map.addSource("clip-area", {
        type: "geojson",
        data: geoData.clipArea,
      });
    },
    [geoData]
  );

  // Fonction pour ajouter les couches visuelles
  const addVisualLayers = useCallback((map) => {
    // Espaces verts
    map.addLayer({
      id: "green-areas",
      type: "fill",
      source: "green-spaces",
      paint: {
        "fill-color": "#2d5a27",
        "fill-opacity": 0.6,
      },
    });

    // Marquages routiers
    map.addLayer({
      id: "crosswalks",
      type: "line",
      source: "road-markings",
      paint: {
        "line-color": "#ffffff",
        "line-width": 8,
        "line-dasharray": [1, 1],
      },
    });

    // Effet sonar
    map.addLayer({
      id: "sonar-pulse",
      type: "circle",
      source: "sonar-center",
      paint: {
        "circle-radius": 25,
        "circle-color": "#00FF00",
        "circle-opacity": 0.1,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#00FF00",
        "circle-stroke-opacity": 0.4,
      },
    });
  }, []);

  // Fonction pour configurer les animations (avec correction de l'opacité)
  const setupAnimations = useCallback((map) => {
    let sonarRadius = 25;
    let sonarDirection = 1;
    let waveTime = 0;

    // Animation du sonar pulsant
    const animateSonar = () => {
      sonarRadius += sonarDirection * 1.5;
      if (sonarRadius >= 40 || sonarRadius <= 15) {
        sonarDirection *= -1;
      }
      if (map.getLayer("sonar-pulse")) {
        map.setPaintProperty("sonar-pulse", "circle-radius", sonarRadius);

        // Correction: s'assurer que l'opacité reste entre 0 et 1
        const opacity = Math.max(
          0,
          Math.min(1, 0.2 - (sonarRadius - 15) / 100)
        );
        map.setPaintProperty("sonar-pulse", "circle-opacity", opacity);
      }
      const frameId = requestAnimationFrame(animateSonar);
      animationFramesRef.current.push(frameId);
    };

    // Animation des vagues sur l'eau
    const animateWaves = () => {
      waveTime += 0.03;
      if (map.getLayer("water-surface")) {
        // Correction: s'assurer que l'opacité reste entre 0 et 1
        const opacity = Math.max(
          0,
          Math.min(1, 0.3 + Math.sin(waveTime) * 0.1)
        );
        map.setPaintProperty("water-surface", "fill-opacity", opacity);
      }
      const frameId = requestAnimationFrame(animateWaves);
      animationFramesRef.current.push(frameId);
    };

    // Démarrer les animations
    animateSonar();
    animateWaves();
  }, []);

  // Initialisation de la carte
  useEffect(() => {
    const map = initializeMap();

    map.on("style.load", () => {
      // Configuration d'éclairage
      map.setConfigProperty("basemap", "lightPreset", "dusk");
      map.setConfigProperty("basemap", "showPointOfInterestLabels", true);
      map.setConfigProperty("basemap", "showRoadLabels", true);
      map.setConfigProperty("basemap", "showPlaceLabels", true);

      // Ajouter les sources et couches
      addDataSources(map);
      addVisualLayers(map);

      // Configurer les animations
      setupAnimations(map);
    });

    // Ajouter le marqueur sous-marin
    new mapboxgl.Marker(createSubmarineMarkerElement())
      .setLngLat(position)
      .addTo(map);

    // Animation de caméra
    setTimeout(() => {
      map.easeTo({
        bearing: map.getBearing() + 20,
        pitch: 45,
        duration: 6000,
        easing: (t) => t * (2 - t),
      });
    }, 2000);

    // Nettoyage
    return () => {
      // Annuler toutes les animations en cours
      animationFramesRef.current.forEach((frameId) => {
        cancelAnimationFrame(frameId);
      });
      animationFramesRef.current = [];

      // Supprimer la carte
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    position,
    initializeMap,
    addDataSources,
    addVisualLayers,
    setupAnimations,
  ]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map-view" />
    </div>
  );
};

export default MapView;
