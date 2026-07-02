import React, { Component } from "react";
import ReactApexChart from "react-apexcharts";

/* Recovered Chart Start */
class RecoveredChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: "New",
          data: [75, 150, 225, 200, 35, 50, 150],
        },
        {
          name: "Recovered",
          data: [-100, -55, -40, -120, -70, -40, -60],
        },
      ],
      options: {
        chart: {
          type: "bar",
          height: 250,
          stacked: true,
          toolbar: {
            show: false,
          },
          sparkline: {
            //enabled: true
          },
          offsetX: -10,
        },
        plotOptions: {
          bar: {
            columnWidth: "25%",
            endingShape: "rounded",

            colors: {
              backgroundBarColors: ["#f0f0f0", "#f0f0f0", "#f0f0f0", "#f0f0f0"],
              backgroundBarOpacity: 1,
              backgroundBarRadius: 5,
            },
          },
          distributed: true,
        },
        colors: ["#209f84", "#ff2c53"],
        grid: {
          show: false,
        },
        legend: {
          show: false,
        },
        fill: {
          opacity: 1,
        },
        dataLabels: {
          enabled: false,
          colors: ["#000"],
          dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 1,
          },
        },
        xaxis: {
          categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          labels: {
            style: {
              colors: "#787878",
              fontSize: "13px",
              fontFamily: "poppins",
              fontWeight: 100,
              cssClass: "apexcharts-xaxis-label",
            },
          },
          crosshairs: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        },

        yaxis: {
          show: false,
        },

        tooltip: {
          x: {
            show: true,
          },
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
          type="bar"
          height={270}
        />
      </>
    );
  }
}

export default RecoveredChart;
