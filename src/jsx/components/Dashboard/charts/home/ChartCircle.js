import React, { Component } from "react";
import ReactApexChart from "react-apexcharts";

/* Circle Chart Start */
class ChartCircle extends Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [64, 73, 48],
      options: {
        chart: {
          type: "radialBar",
          //width:320,
          height: 350,
          offsetY: 0,
          offsetX: 0,
        },
        plotOptions: {
          radialBar: {
            size: undefined,
            inverseOrder: false,
            hollow: {
              margin: 0,
              size: "35%",
              background: "transparent",
            },

            track: {
              show: true,
              background: "#e1e5ff",
              strokeWidth: "10%",
              opacity: 1,
              margin: 15, // margin is in pixels
            },
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                offsetY: 0,
                offsetX: 0,
              },
              legend: {
                position: "bottom",
                offsetX: 0,
                offsetY: 0,
              },
            },
          },
        ],

        fill: {
          opacity: 1,
        },

        colors: ["#ff2c53", "#209f84", "#ff5c00"],
        series: [71, 63, 90],
        labels: ["New", "Recover", "In Treatment"],
        legend: {
          fontSize: "16px",
          show: false,
        },
      },
    };
  }

  render() {
    return (
      <>
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="radialBar"
          height={350}
        />
      </>
    );
  }
}

export default ChartCircle;
