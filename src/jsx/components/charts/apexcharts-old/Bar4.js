import React from "react";

import ReactApexChart from "react-apexcharts";

class ApexBar4 extends React.Component {
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
                  [12, 4],
                  [14, 6],
               ],
               bars: {
                  show: true,
                  lineWidth: 0,
                  fillColor: "#36c95f",
               },
            },
         ],
         options: {
            bars: {
               show: true,
               lineWidth: 0,
               fillColor: "#36c95f",
            },
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
export default ApexBar4;
