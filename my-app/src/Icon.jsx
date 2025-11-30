import React from "react";
import "./Styles/icons.css";

export default function Icon({
  icon = "image-broken",
  iconStyle = "normal",
  onClick,
}) {
  const classes = [
    iconStyle === "normal" ? "ph" : `ph-${iconStyle}`,
    `ph-${icon}`,
  ].join(" ");

  return (
    <span
      className="icon"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <i className={classes}></i>
    </span>
  );
}
