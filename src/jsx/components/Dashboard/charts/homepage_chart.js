import React, { Component } from "react";
import ReactApexChart from "react-apexcharts";

{
   /* Recovered Chart Start */
}
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
               height: 950,
               stacked: true,
            },
            colors: ["#209f84", "#ff2c53"],
            plotOptions: {
               bar: {
                  columnWidth: "25%",
                  endingShape: "rounded",

                  colors: {
                     backgroundBarColors: [
                        "#f0f0f0",
                        "#f0f0f0",
                        "#f0f0f0",
                        "#f0f0f0",
                     ],
                     backgroundBarOpacity: 1,
                     backgroundBarRadius: 5,
                  },
               },
               distributed: true,
            },
            dataLabels: {
               enabled: false,
            },
            stroke: {
               width: 1,
               colors: ["#fff"],
            },

            grid: {
               xaxis: {
                  lines: {
                     show: false,
                  },
               },
            },
            yaxis: {
               show: false,
               // min: -5,
               // max: 5,
               // title: {
               // 	// text: 'Age',
               // },
            },
            tooltip: {
               shared: false,
               x: {
                  formatter: function (val) {
                     return val;
                  },
               },
               y: {
                  formatter: function (val) {
                     return Math.abs(val);
                  },
               },
            },
            // title: {
            // 	text: 'Mauritius population pyramid 2011'
            // },
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
                  crosshairs: {
                     show: false,
                  },
                  axisBorder: {
                     show: false,
                  },
               },
               // title: {
               // 	text: 'Percent'
               // },
               // labels: {
               //   formatter: function (val) {
               //     return Math.abs(Math.round(val)) + "%"
               //   }
               // }
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

{
   /* Visitor Chart Start */
}
class VisitorChart extends Component {
   constructor(props) {
      super(props);

      this.state = {
         series: [
            {
               name: "Series 1",
               data: [
                  [1327359600000, 31.95],
                  [1327532400000, 32],
                  [1327878000000, 33.0],
                  [1328050800000, 32.5],
                  [1328223600000, 31.85],
                  [1328569200000, 32.28],
                  [1328742000000, 32.65],
                  [1329087600000, 32.35],
                  [1329260400000, 32.46],
                  [1329433200000, 32.75],
                  [1329865200000, 32.33],
                  [1330038000000, 33.41],
                  [1330383600000, 33.27],
                  [1330556400000, 33.1],
                  [1330902000000, 33.22],
                  [1331074800000, 32.41],
                  [1331247600000, 33.64],
                  [1331593200000, 34.22],
                  [1331766000000, 34.17],
                  [1332111600000, 34.51],
                  [1332284400000, 33.56],
                  [1332457200000, 33.81],
                  [1332799200000, 34.63],
                  [1332972000000, 34.48],
                  [1333317600000, 34.7],
                  [1333490400000, 33.46],
                  [1333922400000, 33.22],
                  [1334095200000, 33.01],
                  [1334268000000, 33.18],
                  [1334613600000, 33.84],
                  [1334786400000, 32.91],
                  [1335132000000, 32.62],
                  [1335304800000, 33.13],
                  [1335477600000, 33.58],
                  [1335823200000, 33.77],
                  [1335996000000, 33.32],
                  [1336082400000, 32.61],
                  [1336428000000, 32.67],
                  [1336600800000, 31.92],
                  [1336946400000, 32.23],
                  [1337119200000, 32.36],
               ],
            },
         ],
         options: {
            chart: {
               type: "area",
               height: 350,
               zoom: {
                  enabled: false,
               },
            },
            colors: ["#450b5a", "#E91E63", "#9C27B0"],
            dataLabels: {
               enabled: false,
            },
            stroke: {
               curve: "straight",
            },

            //   title: {
            // 	text: 'Fundamental Analysis of Stocks',
            // 	align: 'left'
            //   },
            //   subtitle: {
            // 	text: 'Price Movements',
            // 	align: 'left'
            //   },
            //   labels: series.monthDataSeries1.dates,
            xaxis: {
               type: "datetime",
            },
            yaxis: {
               show: false,
               enabled: false,
            },
            legend: {
               horizontalAlign: "left",
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
               type="area"
               height={350}
            />
         </>
      );
   }
}

{
   /* Circle Chart Start */
}
class ChartCircle extends Component {
   constructor(props) {
      super(props);

      this.state = {
         series: [64, 73, 48],
         options: {
            chart: {
               height: 350,
               type: "radialBar",
            },
            plotOptions: {
               radialBar: {
                  dataLabels: {
                     name: {
                        fontSize: "22px",
                     },
                     value: {
                        fontSize: "16px",
                     },
                     total: {
                        show: true,
                        label: "Total",
                        formatter: function (w) {
                           // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                           return 562084;
                        },
                     },
                  },
               },
            },
            labels: ["In Treatment", "Recover", "New"],
            colors: ["#ff2c53", "#209f84", "#ff5c00"],
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

{
   /* Revenue Chart Start */
}
class RevenueChart extends Component {
   constructor(props) {
      super(props);

      this.state = {
         series: [
            {
               name: "Net Profit",
               data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
            },
            {
               name: "Revenue",
               data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
            },
         ],
         options: {
            colors: ["#450b5a", "#ff2c53"],
            chart: {
               type: "bar",
               height: 350,
            },
            plotOptions: {
               bar: {
                  horizontal: false,
                  columnWidth: "40%",
                  endingShape: "rounded",
               },
            },
            dataLabels: {
               enabled: false,
            },
            stroke: {
               show: true,
               width: 2,
               colors: ["transparent"],
            },
            xaxis: {
               categories: [
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
               ],
            },
            yaxis: {
               title: {
                  text: "$ (thousands)",
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
         <>
            <ReactApexChart
               options={this.state.options}
               series={this.state.series}
               type="bar"
               height={350}
            />
         </>
      );
   }
}

export { RecoveredChart, VisitorChart, ChartCircle, RevenueChart };
