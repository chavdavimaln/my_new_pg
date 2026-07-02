import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Dropdown, ProgressBar } from "react-bootstrap";
import SimpleSlider from "./slider/Sleek-Slider";
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";

//images imported
import avatar1 from "../../../images/avatar/2.jpg";
import map from "../../../images/map.jpg";

const PatientDetailsChart = loadable(() =>
   pMinDelay(import("./charts/patient_details_chart"), 1000)
);

class PatientDetails extends Component {
   render() {
      const style = {
         barHeight: {
            height: "8px",
         },
         ninetyW: {},
         eightyfiveW: {},
         SixtyfiveW: {},
      };
      return (
         <>
            <div className="form-head d-flex mb-md-5 mb-3 align-items-start flex-wrap">
               <Link to="#" className="btn btn-dark">
                  <i className="flaticon-381-clock me-2"></i> Edit Profile
               </Link>
               <Link to="#" className="btn btn-outline-danger ms-auto">
                  <i className="flaticon-381-error"></i> Reject Patient
               </Link>
               <Link to="#" className="btn btn-success ms-2">
                  <i className="flaticon-381-success-2"></i> Accept Patient
               </Link>
            </div>

            <div className="row">
               <div className="col-xl-8">
                  <div className="row">
                     <div className="col-md-12">
                        <div className="card">
                           <div className="card-body">
                              <div className="d-flex doctor-info-details mb-5">
                                 <div className="media align-self-start">
                                    <img
                                       src={avatar1}
                                       className="img-fluid rounded"
                                       width={130}
                                       alt=""
                                    />
                                    <i className="flaticon-381-heart"></i>
                                 </div>
                                 <div className="media-body">
                                    <h2 className="mb-2">Brian Lucky</h2>
                                    <p className="mb-md-2 mb-4">#P-00016</p>
                                    <span className="mb-md-0 mb-3 d-block">
                                       <i className="flaticon-381-clock"></i> Join
                                       Date 21 August 2023, 12:45 AM
                                    </span>
                                 </div>
                                 <div className="text-md-end">
                                    <Dropdown className=" mb-md-3 mb-2 show">
                                       <Dropdown.Toggle
                                          variant="primary"
                                          id="dropdown-basic"
                                       >
                                          <i className="flaticon-381-user-7 me-2"></i>{" "}
                                          <span>Cold & Flu</span>
                                       </Dropdown.Toggle>
                                       <Dropdown.Menu className="dropdown-menu-left" >
                                          <Dropdown.Item href="#">
                                             A To Z List
                                          </Dropdown.Item>
                                          <Dropdown.Item href="#">
                                             Z To A List
                                          </Dropdown.Item>
                                       </Dropdown.Menu>
                                    </Dropdown>
                                    <div className="star-review">
                                       <i className="fa fa-star me-1 me-1 text-orange"></i>
                                       <i className="fa fa-star me-1 me-1 text-orange"></i>
                                       <i className="fa fa-star me-1 me-1 text-orange"></i>
                                       <i className="fa fa-star me-1 me-1 text-orange"></i>
                                       <i className="fa fa-star me-1 me-1 text-gray"></i>
                                       <span className="ms-3">238 reviews</span>
                                    </div>
                                 </div>
                              </div>

                              <div className="doctor-info-content">
                                 <h3 className="text-black mb-3">
                                    Story About Disease
                                 </h3>
                                 <p className="mb-3">
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat. Duis aute irure
                                    dolor in reprehenderit in voluptate velit
                                    esse cillum dolore eu fugiat nulla pariatur.
                                    Excepteur sint occaecat cupidatat non
                                    proident, sunt in culpa qui officia deserunt
                                    mollit anim id est laborum
                                 </p>
                                 <p className="mb-2">
                                    Sed ut perspiciatis unde omnis iste natus
                                    error sit voluptatem accusantium doloremque
                                    laudantium, totam rem aperiam, eaque ipsa
                                    quae ab illo inventore veritatis et quasi
                                    architecto beatae vitae dicta sunt
                                    explicabo. Nemo enim ipsam voluptatem quia
                                    voluptas sit aspernatur aut odit aut fugit,
                                    sed quia consequuntur magni dolores eos qui
                                    ratione voluptatem sequi nesciunt. Neque
                                    porro quisquam est, qui dolorem ipsum quia
                                    dolor sit amet, consectetur, adipisci velit,
                                    sed quia non numquam eius modi{" "}
                                 </p>
                              </div>
                           </div>
                           <div className="card-footer border-0 pt-0 text-center">
                              <Link to="#" className="btn-link">
                                 Read More
                              </Link>
                           </div>
                        </div>
                     </div>
                     <div className="col-md-12">
                        <div className="card">
                           <div className="card-header border-0 pb-0">
                              <h4 className="card-title">Assigned Doctor</h4>
                           </div>
                           <SimpleSlider />
                        </div>
                     </div>
                     <div className="col-md-6">
                        <div className="card">
                           <div className="card-header border-0 pb-0">
                              <h4 className="card-title">Disease History</h4>
                           </div>
                           <div className="card-body">
                              <div className="widget-timeline-icon">
                                 <ul className="timeline">
                                    <li>
                                       <div className="icon bg-primary flaticon-381-heart"></div>
                                       <Link
                                          className="timeline-panel text-muted"
                                          to="#"
                                       >
                                          <h4 className="mb-2 mt-1">Diabetes</h4>
                                          <p className="fs-15 mb-0 ">
                                             Sat, 23 Jul 2023, 01:24 PM
                                          </p>
                                       </Link>
                                    </li>
                                    <li>
                                       <div className="icon bg-primary flaticon-381-heart"></div>
                                       <Link
                                          className="timeline-panel text-muted"
                                          to="#"
                                       >
                                          <h4 className="mb-2 mt-1">
                                             Sleep Problem
                                          </h4>
                                          <p className="fs-15 mb-0 ">
                                             Sat, 23 Jul 2023, 01:24 PM
                                          </p>
                                       </Link>
                                    </li>
                                    <li>
                                       <div className="icon bg-primary flaticon-381-heart"></div>
                                       <Link
                                          className="timeline-panel text-muted"
                                          to="#"
                                       >
                                          <h4 className="mb-2 mt-1">Dental Care</h4>
                                          <p className="fs-15 mb-0 ">
                                             Sat, 23 Jul 2023, 01:24 PM
                                          </p>
                                       </Link>
                                    </li>
                                    <li>
                                       <div className="icon bg-primary flaticon-381-heart"></div>
                                       <Link
                                          className="timeline-panel text-muted"
                                          to="#"
                                       >
                                          <h4 className="mb-2 mt-1">Diabetes</h4>
                                          <p className="fs-15 mb-0 ">
                                             Sat, 23 Jul 2023, 01:24 PM
                                          </p>
                                       </Link>
                                    </li>
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="col-md-6">
                        <div className="card">
                           <div className="card-header border-0 pb-0">
                              <h4 className="card-title">Patient Statistic</h4>
                           </div>
                           <div className="card-body">
                              <div className="widget-timeline-icon">
                                 <div className="row align-items-center mx-0">
                                    <div className="col-xl-12 col-md-12 px-0 mb-3">
                                       <PatientDetailsChart />                                      
                                    </div>
                                    <div className="col-xl-12 col-md-12 px-0">
                                       <p className="mb-2 d-flex  fs-14">
                                          Immunities (24%)
                                          <span className="pull-end ms-auto">
                                             25
                                          </span>
                                       </p>
                                       <ProgressBar
                                          className="mb-3"
                                          style={style.barHeight}
                                          variant="info"
                                          now={60}    
                                       /> 

                                       <p className="mb-2 d-flex  fs-14">
                                          Heart Beat (41%)
                                          <span className="pull-end ms-auto">
                                             12
                                          </span>
                                       </p>
                                       <ProgressBar
                                          className="mb-3"
                                          style={style.barHeight}
                                          variant="success"
                                          now={41}
                                       /> 

                                       <p className="mb-2 d-flex  fs-14">
                                          Weigth (15%)
                                          <span className="pull-end ms-auto">
                                             15
                                          </span>
                                       </p>
                                       <ProgressBar
                                          className="mb-3"
                                          style={style.barHeight}
                                          variant="danger"
                                          now={15} 
                                       />
                                    </div >
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="col-xl-4">
                  <div className="row">
                     <div className="col-md-12">
                        <div className="card">
                           <div className="card-body">
                              <div className="patient-map-area mb-4">
                                 <img src={map} alt="" />
                                 <Link to="#" className="btn btn-danger btn-xs">
                                    View in Fullscreen
                                 </Link>
                                 <i className="flaticon-381-location-4"></i>
                              </div>
                              <div className="iconbox">
                                 <i className="las la-map-marker-alt"></i>
                                 <small>Address</small>
                                 <p>
                                    795 Folsom Ave, Suite 600 San Francisco,
                                    CADGE 94107
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="col-md-12">
                        <div className="card">
                           <div className="card-body">
                              <div className="iconbox">
                                 <i className="las la-phone"></i>
                                 <small>Phone</small>
                                 <p>+12 5123 5512 66</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="col-md-12">
                        <div className="card">
                           <div className="card-body">
                              <div className="iconbox">
                                 <i className="las la-envelope-open"></i>
                                 <small>Email</small>
                                 <p>example@mail.com</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="col-md-12">
                        <div className="card bg-secondary">
                           <div className="card-header border-0 pb-0">
                              <h4 className="card-title text-white mt-1">
                                 Note for Patient
                              </h4>
                           </div>
                           <div className="card-body text-white">
                              <p className="mb-0 fs-14">
                                 Lorem ipsum dolor sit amet, consectetur
                                 adipiscing elit, sed do eiusmod tempor
                                 incididunt ut labore et dolore magna aliqua. Ut
                                 enim ad minim veniam, quis nostrud exercitation
                                 ullamco laboris nisi ut aliquip ex ea commodo
                                 consequat. Duis aute irure dolor in
                                 reprehenderit in voluptate velit esse cillum
                                 dolore eu fugiat nulla pariatur. Excepteur sint
                                 occaecat cupidatat non proident, sunt in culpa
                                 qui officia deserunt mollit anim id est laborum
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }
}

export default PatientDetails;

