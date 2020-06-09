import React, { useState } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import "./index.css";

import MapChart from "./MapChart";

function App() {
  
  return (
    <div>
      <MapChart/>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);


