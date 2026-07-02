import React, { Component } from "react";
import ChartistGraph from "react-chartist";

function BarChart() {
   var data = {
      labels: [
         "Jan",
         "Feb",
         "Mar",
         "Apr",
         "May",
         "Jun",
      ],
      series: [
         [5, 4, 3, 7, 5, 10],
         [3, 2, 9, 5, 4, 6],
         [4, 6, 3, 9, 6, 5],
      ],
   };

   var options = {
      fullWidth: true,
      seriesBarDistance: 10,
      chartPadding: {
         right: 40,
      },
   };

   var type = "Bar";

   return (
      <>
         <ChartistGraph data={data} options={options} type={type} id="abc" />
      </>
   );
}

export default BarChart;
