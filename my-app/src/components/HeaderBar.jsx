import React, { useState, useEffect } from "react";
import "../Styles/icons.css";
import "../Styles/HeaderBar.css";
import Icon from "../Icon.jsx";

export default function HeaderBar({ network, submarine, robotOn, setRobotOn }) {
  const [error, setError] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const connectivity = network?.connectivity ?? 0;
  const wifiStrength = network?.wifi ?? 0;
  const isDisconnected = network?.isDisconnected ?? false; // Correction de isDesconected
  const battery = submarine?.battery ?? 0;
  const isCharging = submarine?.isCharging ?? false;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function handlePowerClick() {
    if (robotOn) {
      setRobotOn(false);
    } else {
      setRobotOn(true);
      setError("");
    }
  }

  const formatDateTime = (date) => {
    return date.toLocaleString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bar">
      <div className="zone">
        <div className="HeurDate">
          <span>{formatDateTime(currentDateTime)}</span>
        </div>
        <div className="Power">
          <Icon icon="ph ph-power" onClick={handlePowerClick} />
        </div>
        <span
          className="font-s"
          style={{
            marginLeft: 8,
            color: robotOn ? "white" : "rgb(127, 113, 213)",
          }}
        >
          {robotOn ? "Robot allumé" : "Robot éteint"}
        </span>
      </div>
      <div className="space"></div>
      <div className="zone" style={{ alignItems: "end" }}>
        <span className="font-l">NAUTILUS-X PILOT SYSTEM</span>&nbsp;
        <span className="font-xs">v1.0</span>
      </div>
      <div className="space"></div>
      <div className="zone">
        <span className="font-l">
          {isDisconnected ? (
            <Icon icon="wifi-slash" iconStyle="duotone" />
          ) : wifiStrength === 0 ? (
            <Icon icon="wifi-x" iconStyle="duotone" />
          ) : wifiStrength >= 80 ? (
            <Icon icon="wifi-full" iconStyle="fill" />
          ) : wifiStrength >= 60 ? (
            <Icon icon="wifi-high" iconStyle="fill" />
          ) : wifiStrength >= 40 ? (
            <Icon icon="wifi-medium" iconStyle="fill" />
          ) : wifiStrength >= 20 ? (
            <Icon icon="wifi-low" iconStyle="fill" />
          ) : (
            <Icon icon="wifi-none" iconStyle="fill" />
          )}
        </span>
        <div className="blank"></div>
        <span className="font-l">
          {connectivity === 0 ? (
            <Icon icon="cell-signal-x" iconStyle="duotone" />
          ) : connectivity >= 80 ? (
            <Icon icon="cell-signal-full" iconStyle="fill" />
          ) : connectivity >= 60 ? (
            <Icon icon="cell-signal-high" iconStyle="fill" />
          ) : connectivity >= 40 ? (
            <Icon icon="cell-signal-medium" iconStyle="fill" />
          ) : connectivity >= 20 ? (
            <Icon icon="cell-signal-low" iconStyle="fill" />
          ) : (
            <Icon icon="cell-signal-none" iconStyle="fill" />
          )}
        </span>
        <div className="blank"></div>
        <span className="font-s">{battery}%</span>&nbsp;
        <span className="font-l">
          {isCharging ? (
            <Icon icon="ph ph-battery-charging" iconStyle="fill" />
          ) : battery >= 80 ? (
            <Icon icon="battery-full" iconStyle="fill" />
          ) : battery >= 60 ? (
            <Icon icon="battery-high" iconStyle="fill" />
          ) : battery >= 40 ? (
            <Icon icon="battery-medium" iconStyle="fill" />
          ) : battery >= 20 ? (
            <Icon icon="battery-low" iconStyle="fill" />
          ) : (
            <Icon icon="battery-warning" />
          )}
        </span>
      </div>
    </div>
  );
}
