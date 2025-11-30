import React from "react";
import "../Styles/Loader.css";

const Loader = ({ size = 48, className = "" }) => {
  return (
    <div
      className={`loader ${className}`}
      style={{ width: size, height: size }}
    ></div>
  );
};

export default Loader;
