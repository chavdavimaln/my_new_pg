import React from "react";
import ReactApexChart from "react-apexcharts";

class ApexLine6 extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         series: [
            {
               labels: [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
               ],
               data: [50, 75, 34, 55, 25, 70, 30, 80, 30, 90, 25, 65],
            },
         ],
         options: {
            maintainAspectRatio: false,

            legend: {
               display: false,
            },
            scales: {
               yAxes: [
                  {
                     gridColor: "navy",
                     gridLines: {
                        color: "rgba(0,0,0,0.1)",
                        height: 50,
                        drawBorder: true,
                     },
                     ticks: {
                        fontColor: "#3e4954",
                        max: 100,
                        min: 0,
                        stepSize: 20,
                     },
                  },
               ],
               xAxes: [
                  {
                     barPercentage: 0.3,

                     gridLines: {
                        display: false,
                        zeroLineColor: "transparent",
                     },
                     ticks: {
                        stepSize: 20,
                        fontColor: "#3e4954",
                        fontFamily: "Nunito, sans-serif",
                     },
                  },
               ],
            },
            tooltips: {
               mode: "index",
               intersect: false,
               titleFontColor: "#888",
               bodyFontColor: "#555",
               titleFontSize: 12,
               bodyFontSize: 15,
               backgroundColor: "rgba(255,255,255,1)",
               displayColors: true,
               xPadding: 10,
               yPadding: 7,
               borderColor: "rgba(220, 220, 220, 1)",
               borderWidth: 1,
               caretSize: 6,
               caretPadding: 10,
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
               type="area"
               height={350}
            />
         </div>
      );
   }
}

export default ApexLine6;
