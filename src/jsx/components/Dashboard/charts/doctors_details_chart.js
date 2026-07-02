import React, { Component } from 'react';
import ReactApexChart from "react-apexcharts";

{/** Doctor's Ability Chart Start */}
class DoctorsAbility extends Component {
	constructor(props) {
	  super(props);

	  this.state = {
          
		series: [55, 35, 10],
		options: {
		  chart: {
			width: 380,
			type: 'pie',
		  },
		  colors: ['#07654e', '#209f84', '#93cbff'],
		  labels: ['Operation', 'Theraphy', 'Meditation'],
		  responsive: [{
			breakpoint: 480,
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
			<>
				<ReactApexChart options={this.state.options} series={this.state.series} type="pie" height={380} />
			</>
		);
	}
}

class PatientChart extends Component {
	constructor(props) {
		super(props);

		this.state = {

			series: [{
				name: "Likes",
				data: [4, 3, 10, 9, 50, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 15],
			}],
			options: {
				chart: {
					height: 120,
					type: 'line',
					toolbar: {
						show: false,
					},
					zoom: {
						enabled: false
					}
				},
				dataLabels: {
					enabled: false
				},
				stroke: {
					width: 4,
					curve: 'smooth',
					colors: ['#23a287']
				},
				
				legend: {
					show: false
				},
				tooltip: {
					enabled: true,
				},

				grid: {
					show: false,
				},
				xaxis: {
					show: false,
					lines: {
						show: false,
					},
					labels: {
						show: false,
					},
					axisBorder: {
						show: false,
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
				<ReactApexChart options={this.state.options} series={this.state.series} type="line" height={120} />
			</>
		);
	}
}

export {PatientChart, DoctorsAbility};