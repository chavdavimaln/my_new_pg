import React, { Component } from "react";
import { Doughnut } from "react-chartjs-2";

import {Chart, ArcElement} from 'chart.js'

Chart.register(ArcElement);

class Donut extends Component {
  render() {
    const data = {
      weight: 0,
      defaultFontFamily: "Poppins",
      datasets: [
        {
          data: [20, 50, 30],
          borderWidth: 0,
          backgroundColor: [
            "rgb(32, 159, 132)",
            "rgba(39, 129, 213, 1)",
            "rgba(255, 44, 83, 1)",
          ],
        },
      ],
    };

    const options = {
      width: 110,
      cutoutPercentage: 50,
      responsive: false,
      maintainAspectRatio: true,
      tooltips: { enabled: false },
      hover: { mode: null },
    };
    return (
      <div className="donught-chart justify-content-center d-flex" style={{ marginTop: "-10px" }}>
        <Doughnut data={data} options={options} 
          // height={110} width={110}          
        />
      </div>
    );
  }
}

export default Donut;
