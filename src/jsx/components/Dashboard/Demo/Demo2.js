import React, { useState, useContext, useEffect } from "react";
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import { Dropdown, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

import Timeline from "./../Timeline";
import { ThemeContext } from "../../../../context/ThemeContext";

//Images
import avatar from "../../../../images/avatar/1.jpg";
import avatar1 from "../../../../images/avatar/2.jpg";
import avatar2 from "../../../../images/avatar/3.jpg";
import avatar3 from "../../../../images/avatar/4.jpg";
import avatar4 from "../../../../images/avatar/5.jpg";
// import avatar5 from "../../../images/avatar/6.jpg";

const RecoveredChart = loadable(() =>
  pMinDelay(import("./../charts/home/RecoveredChart"), 1000)
);

const VisitorChart = loadable(() =>
  pMinDelay(import("./../charts/home/VisitorChart"), 1000)
);
const ChartCircle = loadable(() =>
  pMinDelay(import("./../charts/home/ChartCircle"), 1000)
);
const RevenueChart = loadable(() =>
  pMinDelay(import("./../charts/home/RevenueChart"), 1000)
);

const cardWidget = [
  {bgcolor:'bg-danger', icons:'flaticon-381-calendar-1', title:'Appointment', digit:'76'},
  {bgcolor:'bg-success', icons:'flaticon-381-diamond', title:'Hospital Earning', digit:'$56'},
  {bgcolor:'bg-info', icons:'flaticon-381-heart', title:'Total Patient', digit:'78K'},
  {bgcolor:'bg-primary', icons:'flaticon-381-user-7', title:'Doctor', digit:'76'}
];

const patientTable = [
  { id:'1', image: avatar, name:'Media heading', year:'12', category:'Allergies & Asthma', status:'Recovered', type:'success' },
  { id:'2', image: avatar1, name:'Angela Nurhayati', year:'21', category:'Sleep Problem', status:'New Patient', type:'danger' },
  { id:'3', image: avatar2, name:'James Robinson', year:'07', category:'Dental Care', status:'In Treatment', type:'warning' },
  { id:'4', image: avatar3, name:'Thomas Jaja', year:'17', category:'Diabetes', status:'Recovered', type:'success' },
  { id:'5', image: avatar4, name:'Cindy Brownleee', year:'10', category:'Covid-19 Suspect', status:'New Patient', type:'danger' },
  // { id:'6', image: avatar5, name:'Oconner Jr.', year:'11', category:'Dental Care', status:'In Treatment', type:'warning' },
];

const Demo2 = () => { 
  const [active, setActive] = useState('3');
  const { changeBackground ,changeSideBarStyle,
    changeNavigationHader,
    chnageSidebarColor,
    chnageHaderColor,
    changePrimaryColor,

    } = useContext(ThemeContext);
	useEffect(() => {
		changeBackground({ value: "light", label: "Light" });		
		changeSideBarStyle({ value: "compact", label: "Compact" });
        chnageSidebarColor('color_2');
        changeNavigationHader('color_2');
        chnageHaderColor('color_2');
        changePrimaryColor('color_2');
	}, []);
  return (
      <>
        <div className="form-head d-flex mb-3 mb-md-5 align-items-start flex-wrap justify-content-between">
          <div className="me-auto d-lg-block">
            <h3 className="text-primary font-w600">Welcome to Mediqu!</h3>
            <p className="mb-0">Hospital Admin Dashboard Template</p>
          </div>
          <form className="default-search">
            <div className="input-group search-area ms-auto w-100 d-inline-flex">
              <input type="text" className="form-control" placeholder="Search here" />              
              <span className="input-group-text">
                <i className="flaticon-381-search-2"></i>
              </span>              
            </div>
          </form>          
        </div>
        <div className="row">
          <div className="col-xl-6 col-xxl-12">
            <div className="row">             
              <div className="col-xl-6 col-xxl-6 col-lg-6 col-md-6">
                <div className="card">
                  <div className="card-header border-0 pb-0">
                    <h4 className="card-title">Recovered</h4>
                    <Dropdown className="ms-auto no-carat">
                      <Dropdown.Toggle
                        as="div"
                        variant=""
                        id="dropdown-basic"
                        className="p-0 i-false btn-link"
                      >
                        <svg
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                          version="1.1"
                        >
                          <g
                            stroke="none"
                            strokeWidth="1"
                            fill="none"
                            fillRule="evenodd"
                          >
                            <rect x="0" y="0" width="24" height="24"></rect>
                            <circle
                              fill="#000000"
                              cx="5"
                              cy="12"
                              r="2"
                            ></circle>
                            <circle
                              fill="#000000"
                              cx="12"
                              cy="12"
                              r="2"
                            ></circle>
                            <circle
                              fill="#000000"
                              cx="19"
                              cy="12"
                              r="2"
                            ></circle>
                          </g>
                        </svg>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="dropdown-menu-right">
                        <Dropdown.Item>Edit</Dropdown.Item>
                        <Dropdown.Item>Delete</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <div className="card-body pb-0">
                    <div className="recovered-chart-deta d-flex flex-wrap">
                      <div className="col mb-3">
                        <span className="bg-danger"></span>
                        <div>
                          <p>New</p>
                          <h5>451</h5>
                        </div>
                      </div>
                      <div className="col mb-3">
                        <span className="bg-success"></span>
                        <div>
                          <p>Recovered</p>
                          <h5>623</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body pt-0 px-3 pb-0">                    
                      <RecoveredChart />                    
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-xxl-6 col-lg-6 col-md-6">
                <div className="card">
                  <div className="card-header border-0 pb-0">
                    <h4 className="card-title">Visitors</h4>
                    <Dropdown className="ms-auto no-carat">
                      <Dropdown.Toggle
                        variant=""
                        as="div"
                        id="dropdown-basic"
                        className="p-0 i-false btn-link"
                      >
                        <svg
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                          version="1.1"
                        >
                          <g
                            stroke="none"
                            strokeWidth="1"
                            fill="none"
                            fillRule="evenodd"
                          >
                            <rect x="0" y="0" width="24" height="24"></rect>
                            <circle
                              fill="#000000"
                              cx="5"
                              cy="12"
                              r="2"
                            ></circle>
                            <circle
                              fill="#000000"
                              cx="12"
                              cy="12"
                              r="2"
                            ></circle>
                            <circle
                              fill="#000000"
                              cx="19"
                              cy="12"
                              r="2"
                            ></circle>
                          </g>
                        </svg>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="dropdown-menu-right">
                        <Dropdown.Item>Edit</Dropdown.Item>
                        <Dropdown.Item>Delete</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <div className="card-body px-3 pt-2 pb-0">
                    <div id="chartStrock">
                      <VisitorChart />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-12 col-xxl-12 col-lg-12 col-md-12">
                <div className="card">
                  <div className="card-header border-0 pb-0">
                    <h4 className="card-title">Patients (%)</h4>                   
                      <Form.Select className="select-button  style-1 default-select">                        
                        <option value="1">Daily</option>
                        <option value="2">Weekly</option>
                        <option value="3">Monthly</option>
                      </Form.Select>
                  </div>
                  <div className="card-body pt-2">
                    <h4 className="text-dark font-w400">Total Patient</h4>
                    <h3 className="text-primary font-w600">562,084 People</h3>
                    <div className="row mx-0 align-items-center">
                      <div className="col-sm-8 col-md-7 px-0">
                        <div id="chartCircle">
                          <ChartCircle />
                        </div>
                      </div>
                      <div className="col-sm-4 col-md-5 px-0">
                        <div className="patients-chart-deta">
                          <div className="col px-0">
                            <span className="bg-danger"></span>
                            <div>
                              <p>New</p>
                              <h3>64%</h3>
                            </div>
                          </div>
                          <div className="col px-0">
                            <span className="bg-success"></span>
                            <div>
                              <p>Recovered</p>
                              <h3>73%</h3>
                            </div>
                          </div>
                          <div className="col px-0">
                            <span className="bg-warning"></span>
                            <div>
                              <p>In Treatment</p>
                              <h3>48%</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-12 col-xxl-12 col-lg-12 col-md-12">
                <div className="card">
                  <div className="card-header border-0 pb-0">
                    <h4 className="card-title">Recent Patient Activity</h4>
                    <Dropdown className="ms-auto no-carat">
                      <Dropdown.Toggle
                        variant=""                       
                        className="p-0 i-false btn-link"
                      >
                        <svg
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                          version="1.1"
                        >
                          <g
                            stroke="none"
                            strokeWidth="1"
                            fill="none"
                            fillRule="evenodd"
                          >
                            <rect x="0" y="0" width="24" height="24"></rect>
                            <circle
                              fill="#000000"
                              cx="5"
                              cy="12"
                              r="2"
                            ></circle>
                            <circle
                              fill="#000000"
                              cx="12"
                              cy="12"
                              r="2"
                            ></circle>
                            <circle
                              fill="#000000"
                              cx="19"
                              cy="12"
                              r="2"
                            ></circle>
                          </g>
                        </svg>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="dropdown-menu-right">
                        <Dropdown.Item>Edit</Dropdown.Item>
                        <Dropdown.Item>Delete</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive ">
                      <table className="table patient-activity">
                        <tbody>
                          {patientTable.map((data, index)=>(
                            <tr key={index} className={`${active === data.id ? "active" : " "}`}
                              onMouseEnter={()=>setActive(data.id)}
                            >
                              <td>
                                <div className="media align-items-center">
                                  <img className="me-3 img-fluid rounded" src={data.image} width={78} alt=""/>
                                  <div className="media-body">
                                    <h5 className="mt-0 mb-1">{data.name}</h5>
                                    <p className="mb-0">{data.year} Years Old</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <p className="mb-0">Disease</p>
                                <h5 className="my-0 text-primary">{data.category}</h5>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div>
                                    <p className="mb-1">Status</p>
                                    <h5 className={`mt-0 mb-1 text-${data.type}`}>
                                      {data.status}
                                    </h5>
                                    <small>22/03/2023 12:34 AM</small>
                                  </div>
                                  <Dropdown className="ms-auto no-carat">
                                    <Dropdown.Toggle
                                      variant=""
                                      as="div"
                                      id="dropdown-basic"
                                      className="p-0 i-false btn-link"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                        width="24px"
                                        height="24px"
                                        viewBox="0 0 24 24"
                                        version="1.1"
                                      >
                                        <g
                                          stroke="none"
                                          strokeWidth="1"
                                          fill="none"
                                          fillRule="evenodd"
                                        >
                                          <rect
                                            x="0"
                                            y="0"
                                            width="24"
                                            height="24"
                                          ></rect>
                                          <circle
                                            fill="#000000"
                                            cx="12"
                                            cy="5"
                                            r="2"
                                          ></circle>
                                          <circle
                                            fill="#000000"
                                            cx="12"
                                            cy="12"
                                            r="2"
                                          ></circle>
                                          <circle
                                            fill="#000000"
                                            cx="12"
                                            cy="19"
                                            r="2"
                                          ></circle>
                                        </g>
                                      </svg>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="dropdown-menu-right">
                                      <Dropdown.Item>Edit</Dropdown.Item>
                                      <Dropdown.Item>
                                        Delete
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </div>
                              </td>
                            </tr>
                          ))}
                         
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="card-footer border-0 pt-0 text-center">
                    <Link to={"#"} className="btn-link">
                      {/* See More <span>&#187;</span> */}
                      See More {">>"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-xxl-12">
            <div className="row">
              {cardWidget.map((item, ind)=>(
                <div className="col-xl-6 col-lg-6 col-sm-6" key={ind}>
                  <div className={`app-stat card ${item.bgcolor}`}>
                    <div className="card-body  p-4">
                      <div className="media">
                        <span className="me-3">
                          <i className={item.icons}></i>
                        </span>
                        <div className="media-body text-white text-end">
                          <p className="mb-1">{item.title}</p>
                          <h2 className="text-white">{item.digit}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}             
            </div>
            <div className="row">
              <div className="col-xl-12 col-xxl-12 col-lg-12 col-md-12">
                <div className="card">
                  <div className="card-header border-0 pb-0">
                    <h4 className="card-title">Revenue</h4>                    
                    <Form.Select className="select-button  style-1 default-select">                        
                        <option value="1">2021</option>
                        <option value="2">2022</option>
                        <option value="3">2023</option>
                      </Form.Select>
                  </div>
                  <div className="card-body pt-2">
                    <h3 className="text-primary font-w600">
                      $41,512k <small className="text-dark ms-2">$25,612k</small>
                    </h3>
                    <div id="chartBar">
                      <RevenueChart />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <Timeline />
              </div>
            </div>
          </div>
        </div>
      </>
  );
}

export default Demo2;