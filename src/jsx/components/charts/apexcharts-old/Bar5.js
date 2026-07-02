import React from "react";

import ReactApexChart from "react-apexcharts";

class ApexBar5 extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         series: [
            {
               data: [
                  [0, 3],
                  [2, 8],
                  [4, 5],
                  [6, 13],
                  [8, 5],
                  [10, 7],
                  [12, 8],
                  [14, 10],
               ],
               bars: {
                  show: true,
                  lineWidth: 0,
                  fillColor: "#36c95f",
               },
            },
            {
               data: [
                  [1, 5],
                  [3, 7],
                  [5, 10],
                  [7, 7],
                  [9, 9],
                  [11, 5],
                  [13, 4],
                  [15, 6],
               ],
               bars: {
                  show: true,
                  lineWidth: 0,
                  fillColor: "#a336c9",
               },
            },
         ],

         options: {
            grid: {
               borderWidth: 1,
               borderColor: "transparent",
            },
            yaxis: {
               tickColor: "transparent",
               font: {
                  color: "#fff",
                  size: 10,
               },
            },
            xaxis: {
               tickColor: "transparent",
               font: {
                  color: "#fff",
                  size: 10,
               },
            },
         },
      };
   }

   render() {
      return (
         <div id="chart">
            <ReactApexChart
               options={this.state.options}
               series={this.state.series}
               type="bar"
               height={430}
            />
         </div>
      );
   }
}
export default ApexBar5;
