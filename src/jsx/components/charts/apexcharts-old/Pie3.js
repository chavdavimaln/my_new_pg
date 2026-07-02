import React from "react";
import ReactApexChart from "react-apexcharts";

class ApexPie3 extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         labels: ["25%", "35%", "45%"],
         series: [25, 35, 45],

         options: {
            labelInterpolationFnc: function (value) {
               return value[0];
            },
            colors: ["#ff7a00", "#2130b8", "#21b830"],
            chart: {
               width: 220,
               height: 220,
               type: "donut",
               sparkline: {
                  enabled: true,
               },
            },
            plotOptions: {
               pie: {
                  customScale: 1,
                  donut: {
                     size: "40%",
                  },
               },
            },
            dataLabels: {
               enabled: false,
            },
            responsive: [
               {
                  breakpoint: 1300,
                  options: {
                     chart: {
                        width: 120,
                        height: 120,
                     },
                  },
               },
            ],
            legend: {
               show: false,
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
               type="donut"
               height={220}
               // width={220}
            />
         </div>
      );
   }
}

export default ApexPie3;
