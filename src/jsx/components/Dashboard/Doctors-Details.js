import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, Modal } from "react-bootstrap";
import Calendar from "react-calendar";

import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";

import "react-calendar/dist/Calendar.css";

//import Images:
import avatar from "../../../images/avatar/1.jpg";
import avatar1 from "../../../images/avatar/2.jpg";
import avatar2 from "../../../images/avatar/3.jpg";

const PatientChart = loadable(() =>
  pMinDelay(import("./charts/doctor_details/PatientChart"), 1000)
);
const DoctorsAbility = loadable(() =>
  pMinDelay(import("./charts/doctor_details/DoctorsAbility"), 1000)
);

const DoctorsDetails = () => {
  const [value, onChange] = useState(new Date());
  // const [addPlan, setAddPlan] = useState(false);
  const [openModal, setOpenModal] = useState();
  return (
    <React.Fragment>
      <div className="form-head d-flex mb-3 mb-lg-5 align-items-start flex-wrap">
        <Link to={"#"} className="btn btn-dark">
          <i className="flaticon-381-clock me-2"></i> Edit Profile
        </Link>
        <Link to={"#"} className="btn btn-success ms-auto px-5" onClick={()=>setOpenModal(true)}>
          + Add New Appointment
        </Link>
      </div>

      <div className="row">
        <div className="col-xl-4">
          <div className="row">
            <div className="col-lg-6 col-xl-12">
              <div className="card bg-danger">
                <div className="card-header border-0 pb-0 justify-content-center">
                  <h4 className="card-title text-white">Appointment Schedule</h4>
                </div>
                <div className="card-body patient-calender  pb-2">
                  <Calendar onChange={onChange} value={value} />                  
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-xl-12">
              <div className="card abilities-chart">
                <div className="card-header border-0 pb-0">
                  <h4 className="card-title">Doctors Abilities</h4>
                </div>
                <div className="card-body text-center">
                  <DoctorsAbility />

                  <div className="chart-point">
                    <div>
                      <span className="a" />
                      Operation
                    </div>
                    <div>
                      <span className="b" />
                      Theraphy
                    </div>
                    <div>
                      <span className="c" />
                      Mediation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-8">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex doctor-info-details mb-5">
                    <div className="media align-self-start">
                      <img src={avatar1} className="rounded" width={130} alt="" />
                      <i className="flaticon-381-heart"></i>
                    </div>
                    <div className="media-body">
                      <h2 className="mb-2">Dr. Alexndro Zignee</h2>
                      <p className="mb-md-2 mb-sm-4 mb-2">#P-00016</p>
                      <span>
                        <i className="flaticon-381-clock"></i> Join Date 21 August
                        2023, 12:45 AM
                      </span>
                    </div>
                    <div className="text-md-end mt-4 mt-md-0">
                      <Dropdown className="mb-3">
                        <Dropdown.Toggle
                          variant="outline-primary"
                          id="dropdown-basic"
                        >
                          <i className="flaticon-381-user-7 me-2"></i> Dentist
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="dropdown-menu-right">
                          <Dropdown.Item href="#">A To Z List</Dropdown.Item>
                          <Dropdown.Item href="#">Z To A List</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <div className="star-review">
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-gray"></i>
                        <span className="ms-3">238 reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="doctor-info-content">
                    <h3 className="text-black mb-3">Short Biography</h3>
                    <p className="mb-3">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum
                    </p>
                    <p className="mb-2">
                      Sed ut perspiciatis unde omnis iste natus error sit
                      voluptatem accusantium doloremque laudantium, totam rem
                      aperiam, eaque ipsa quae ab illo inventore veritatis et
                      quasi architecto beatae vitae dicta sunt explicabo. Nemo
                      enim ipsam voluptatem quia voluptas sit aspernatur aut
                      odit aut fugit, sed quia consequuntur magni dolores eos
                      qui ratione voluptatem sequi nesciunt. Neque porro
                      quisquam est, qui dolorem ipsum quia dolor sit amet,
                      consectetur, adipisci velit, sed quia non numquam eius
                      modi{" "}
                    </p>
                  </div>
                </div>
                <div className="card-footer border-0 pt-0 text-center">
                  <Link to={"#"} className="btn-link">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="card">
                <div className="card-header border-0 pb-0">
                  <h4 className="card-title">Assigned Patient</h4>
                </div>
                <div className="card-body">
                  <div className="media patient-box d-flex justify-content-between align-self-center">
                    <div className="d-flex align-self-center">
                        <img
                          src={avatar}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="mt-0 mb-2 text-black bold mt-1">
                            <b>Brian Lucky</b>
                          </h3>
                          <h4 className="mb-md-4 mb-1 text-primary">Cold & Flue</h4>
                          <Link to={"#"} className="btn-link me-4 text-dark">
                            Unassign
                          </Link>
                          <Link to={"#"} className="btn-link text-danger ">
                            Check Imporvement
                          </Link>
                        </div>
                      </div>  
                      <div className="d-flex align-self-center">
                        <div id="chart" className="me-3">
                          <PatientChart />
                        </div>
                        <div className="media-footer align-self-center">
                          <div className="up-sign text-success">
                            <i className="fa fa-caret-up"></i>
                            <h3 className="text-success">4%</h3>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="card">
                <div className="card-header border-0 pb-0">
                  <h4 className="card-title">Recent Review</h4>
                </div>
                <div className="card-body">
                  <div className="media review-box mb-4">
                    <img
                      src={avatar}
                      className="me-3 img-fluid rounded"
                      width={105}
                      alt=""
                    />
                    <div className="media-body">
                      <h4 className="mt-0 mb-md-3 mb-1 text-black">Glee Smiley</h4>
                      <p className="mb-3">
                        Hospital & staff were extremely warm & quick in getting
                        me start with the procedures.
                      </p>
                      <span className="btn btn-xs light btn-danger btn-rounded me-1 mb-1">
                        EXCELENT
                      </span>
                      <span className="btn btn-xs light btn-danger btn-rounded me-1 mb-1">
                        GREAT SERVICE
                      </span>
                    </div>
                    <div className="media-footer">
                      <div className="star-review text-md-center">
                        <span className="text-primary me-1">4.5</span>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-gray"></i>
                      </div>
                    </div>
                  </div>
                  <div className="media review-box mb-4">
                    <img
                      src={avatar1}
                      className="me-3 img-fluid rounded"
                      width={105}
                      alt=""
                    />
                    <div className="media-body">
                      <h4 className="mt-0 mb-md-3 mb-1 text-black">Emilian Brownlee</h4>
                      <p className="mb-3">
                        Hospital & staff were extremely warm & quick in getting
                        me start with the procedures.
                      </p>
                      <span className="btn btn-xs light btn-danger btn-rounded me-1 mb-1">
                        EXCELENT
                      </span>
                      <span className="btn btn-xs light btn-danger btn-rounded me-1 mb-1">
                        GREAT SERVICE
                      </span>
                    </div>
                    <div className="media-footer">
                      <div className="star-review text-md-center">
                        <span className="text-primary me-1">4.5</span>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-gray"></i>
                      </div>
                    </div>
                  </div>
                  <div className="media review-box">
                    <img
                      src={avatar2}
                      className="me-3 img-fluid rounded"
                      width={105}
                      alt=""
                    />
                    <div className="media-body">
                      <h4 className="mt-0 mb-md-3 mb-1 text-black">Stevani Anderson</h4>
                      <p className="mb-3">
                        Hospital & staff were extremely warm & quick in getting
                        me start with the procedures.
                      </p>
                      <span className="btn btn-xs light btn-danger btn-rounded me-1 mb-1">
                        EXCELENT
                      </span>
                      <span className="btn btn-xs light btn-danger btn-rounded me-1 mb-1">
                        GREAT SERVICE
                      </span>
                    </div>
                    <div className="media-footer">
                      <div className="star-review text-md-center">
                        <span className="text-primary me-1 ">4.5</span>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-orange"></i>
                        <i className="fa fa-star me-1 text-gray"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer border-0 pt-0 text-center">
                  <Link to={"#"} className="btn-link">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal className="modal fade" id="exampleModal" centered show={openModal} onHide={setOpenModal}>
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">New Appointment</h1>
            <button type="button" className="btn-close" onClick={()=>setOpenModal(false)}></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="row">
                <div className="col-xl-12">
                    <div className="mb-3">
                      <label htmlFor="exampleFormControlInput1" className="form-label">Patient Name</label>
                      <input type="text" className="form-control" id="exampleFormControlInput1" placeholder="Brian Lucky" />
                    </div>
                </div>
                <div className="col-xl-6">
                  <div className="mb-3">
                    <label htmlFor="exampleFormControlInput2" className="form-label">Patient Number</label>
                    <input type="number" className="form-control" id="exampleFormControlInput2" placeholder="+123456789" />
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="mb-3">
                    <label htmlFor="exampleFormControlInput3" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="exampleFormControlInput3" placeholder="name@example.com" />
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-danger light" onClick={()=>setOpenModal(false)}>Close</button>
            <button type="button" className="btn btn-primary">Save changes</button>
          </div>
			  
		 
		  </Modal>
    </React.Fragment>
  );
};

export default DoctorsDetails;

