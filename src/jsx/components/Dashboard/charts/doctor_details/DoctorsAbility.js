import React, { Component } from "react";
// import ChartistGraph from "react-chartist";
import ReactApexChart from "react-apexcharts";

// const options = {
//  series: [30, 25, 15],
//   labels: ["35%", "55%", "10%"],
// }

class Chart extends Component {
  // render() {
    // var data = {
    //   labels: ["35%", "55%", "10%"],
    //   series: [30, 25, 15],
    // };

    // var options = {
    //   labelInterpolationFnc: function (value) {
    //     return value[0];
    //   },
    // };
    // var responsiveOptions = [
    //   [
    //     "screen and (min-width: 230px)",
    //     {
    //       chartPadding: 10,
    //       donut: true,
    //       labelOffset: 40,
    //       donutWidth: 40,
    //       labelDirection: "explode",
    //       labelInterpolationFnc: function (value) {
    //         return value;
    //       },
    //     },
    //   ],
    //   [
    //     "screen and (min-width: 230px)",
    //     {
    //       labelOffset: 60,
    //       chartPadding: 20,
    //     },
    //   ],
    // ];

    // var type = "Pie";
    constructor(props) {
      super(props);

      this.state = {
       
        series: [30, 25, 15],
        options: {
          chart: {
            type: 'donut',            
          },
          plotOptions: {
            pie: {
              donut: {
                size: "50%"
              }
            }
          },          
          labels: ["35%", "55%", "10%"],
          colors:['#209f84', '#07654e', '#93cbff'],
          legend: {
            show : false
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: [0],
          },
          responsive: [{
            breakpoint: 250,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        },
      
      
      };
    }
  render() {
    return (
      <div>        
        <ReactApexChart options={this.state.options} series={this.state.series} type="donut"  height={250}/>
      </div>
    );
  }
}

export default Chart;
