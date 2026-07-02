import React from "react";
import ReactApexChart from "react-apexcharts";

class ApexPie2 extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         labels: ["35%", "55%", "10%"],
         series: [30, 25, 15],
         options: {
            labelInterpolationFnc: function (value) {
               return value[0];
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
               height={350}
            />
         </div>
      );
   }
}

export default ApexPie2;
