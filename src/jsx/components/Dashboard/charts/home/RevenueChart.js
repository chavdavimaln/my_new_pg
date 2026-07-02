import React, { Component } from "react";
import ReactApexChart from "react-apexcharts";

/* Revenue Chart Start */
class RevenueChart extends Component {
   constructor(props) {
      super(props);

      this.state = {
         series: [
            {
               name: "Net Profit",
               data: [44, 55, 90, 80, 25, 15, 70, 55, 35, 15, 70, 55, 95, 35],
            },
            {
               name: "Revenue",
               data: [15, 65, 15, 35, 30, 5, 40, 60, 10, 5, 40, 60, 10, 35]
            },
         ],
         options: {
            colors: ["#450b5a", "#ff2c53"],
            chart: {
               type: "bar",
               height: 350,
               toolbar: {
                  show: false,
               }
            },
            plotOptions: {
               bar: {
                  horizontal: false,
                  columnWidth: "55%",
                  endingShape: "rounded",
               },
            },
            dataLabels: {
               enabled: false,
            },
            markers: {
               shape: "circle",
            },
            legend: {
               show: true,
               fontSize: '12px',
               labels: {
                  colors: '#000000',                  
               },
               markers: {
                  width: 18,
                  height: 18,
                  strokeWidth: 0,
                  strokeColor: '#fff',
                  fillColors: undefined,
                  radius: 12,	
               }
            },
            stroke: {
               show: true,
               width: 1,
               colors: ["transparent"],
            },
            grid: {
               borderColor: '#eee',
            },
            xaxis: {
               categories: ['01', '02', '03', '04', '05', '06', '07', '08', '09','10','11','12','13','14'],
               labels: {
                style: {
                  colors: '#787878',
                  fontSize: '13px',
                  fontFamily: 'poppins',
                  fontWeight: 100,
                  cssClass: 'apexcharts-xaxis-label',
                },
               },
               crosshairs: {
                  show: false,
               }
            },
            yaxis: {
               labels: {
                  style: {
                    colors: '#787878',
                    fontSize: '13px',
                     fontFamily: 'poppins',
                    fontWeight: 100,
                    cssClass: 'apexcharts-xaxis-label',
                 },
               },
            },
            fill: {
               opacity: 1,
            },
            tooltip: {
               y: {
                  formatter: function (val) {
                     return "$ " + val + " thousands";
                  },
               },
            },
         },
      };
   }
   render() {
      return (
         <div id="chartTimeline">
            <ReactApexChart
               options={this.state.options}
               series={this.state.series}
               type="bar"
               height={350}
            />
         </div>
      );
   }
}

export default RevenueChart;
