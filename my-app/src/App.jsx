import React, { useState, useEffect } from "react";
import MapView from "./components/MapView";
import HeaderBar from "./components/HeaderBar";
import Loader from "./components/Loader";
import "./Styles/App.css";
import "./fonts/all.css";

export default function App() {
  const [gpsPosition] = useState([10.18, 36.8]);
  const [network, setNetwork] = useState({
    connectivity: 30,
    wifi: 0,
    isDisconnected: true,
  });
  const [submarine, setSubmarine] = useState({
    battery: 50,
    isCharging: false,
  });
  const [robotOn, setRobotOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  window.setSubmarine = setSubmarine;
  window.setRobotOn = setRobotOn;
  window.setIsLoading = setIsLoading;
  window.setNetwork = setNetwork;

  if (isLoading) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="main">
      <div className="top-bar">
        <HeaderBar
          network={network}
          submarine={submarine}
          robotOn={robotOn}
          setRobotOn={setRobotOn}
        />
      </div>
      <div className="expand">
        <MapView position={gpsPosition} />
      </div>
    </div>
  );
}
