import React, { useState } from "react";
import { Dropdown , Modal} from "react-bootstrap";
import { Link } from "react-router-dom";
import DoctorsAccordion from "./DoctorsAccordion";

function onClick (){

}

const Doctors = () => {  
  const  [addDoctor, setAddDoctor] = useState();
    return (
      <React.Fragment>
        <div className="form-head d-flex mb-3 mb-lg-5 align-items-start flex-wrap">
          <Link onClick={()=>setAddDoctor(true)} className="btn btn-danger">
            + New Doctor
          </Link>
          <div className="input-group search-area ms-auto d-inline-flex">
              <input type="text" className="form-control" placeholder="Search here" />           
              <span className="input-group-text c-pointer">
                <i className="flaticon-381-search-2"></i>
              </span>           
          </div>
          <Dropdown className="ms-3">
            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
              <i className="flaticon-381-controls-3 "></i> Filter
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-right">
              <Dropdown.Item href="#">A To Z List</Dropdown.Item>
              <Dropdown.Item href="#">Z To A List</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown className="ms-3">
            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">Newest</Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-right">
              <Dropdown.Item href="#">Newest</Dropdown.Item>
              <Dropdown.Item href="#">Old</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Link onClick={onClick} className="btn btn-outline-primary ms-3">
            <i className="flaticon-381-menu-1 me-0"></i>
          </Link>
          <Link onClick={onClick} className="btn btn-light ms-3">
            <i className="flaticon-381-pad me-0"></i>
          </Link>
        </div>
        <DoctorsAccordion />

        <Modal className="modal fade"  centered show={addDoctor} onHide={setAddDoctor} >
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel-1">Add Doctor</h1>
              <button type="button" className="btn-close" onClick={()=>setAddDoctor(false)}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-xl-12">
                      <div className="mb-3">
                        <label htmlfor="exampleFormControlInput6" className="form-label">Doctor Name</label>
                        <input type="text" className="form-control" id="exampleFormControlInput6" placeholder="Dr. Samantha Queque" />
                      </div>
                  </div>
                  <div className="col-xl-6">
                      <div className="mb-3">
                        <label htmlfor="exampleFormControlInput7" className="form-label">Doctor Name</label>
                        <input type="number" className="form-control" id="exampleFormControlInput7" placeholder="+9123654789" />
                      </div>
                  </div>
                  <div className="col-xl-6">
                      <div className="mb-3">
                        <label htmlfor="exampleFormControlInput8" className="form-label">Email address</label>
                        <input type="email" className="form-control" id="exampleFormControlInput8" placeholder="name@example.com" />
                      </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-danger light" onClick={()=>setAddDoctor(false)}>Close</button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div>
        </Modal>
      </React.Fragment>
  );
  
}

export default Doctors;
