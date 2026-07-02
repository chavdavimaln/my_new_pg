import React, { Component } from "react";
import ReactApexChart from "react-apexcharts";

/** Patients Status Chart Start */
class PatientChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: "Likes",
          data: [4, 3, 10, 9, 50, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 15],
        },
      ],
      options: {
        chart: {
          toolbar: {
            show: false,
          },
          height: 120,
          type: "line",
        },
        stroke: {
          width: 4,
          curve: "smooth",
          colors: ["#23a287"],
        },

        legend: {
          show: false,
        },
        tooltip: {
          enabled: true,
        },

        grid: {
          show: false,
        },

        xaxis: {
          type: "category",
          categories: [],
          labels: {
            show: false,
            enabled: false,
          },
          axisBorder: {
            show: false,
            enabled: false,
          },
          axisTicks: {
            show: false,
            enabled: false,
          },
          crosshairs: {
            show: false,
            enabled: false,

            fill: {
              show: false,
              enabled: false,
            },
          },
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
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
          type="line"
          height={120}
        />
      </>
    );
  }
}

export default PatientChart;
