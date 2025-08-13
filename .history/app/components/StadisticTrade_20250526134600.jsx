import React from "react";
import StadisticTradeDiaHora from "../reportes/components/StadisticTradeDiaHora";
import TopComidas from "../reportes/components/TopComidas";
import StadisticDinner from "../reportes/components/StadisticDinner";

function StadisticTrade() {
  return (
    <div>
      <StadisticTradeDiaHora />
      <TopComidas />
      <StadisticDinner />
    </div>
  );
}

export default StadisticTrade;
