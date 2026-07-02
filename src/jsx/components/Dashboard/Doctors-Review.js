import React, { Component } from "react";
import { Dropdown, Nav, Tab } from "react-bootstrap";
import { Link } from "react-router-dom";
//images imported
import avatar from "../../../images/avatar/1.jpg";
import avatar1 from "../../../images/avatar/2.jpg";
import avatar2 from "../../../images/avatar/3.jpg";
import avatar3 from "../../../images/avatar/4.jpg";

class DoctorsReview extends Component {
  render() {
    return (
      <>
        <div className="form-head d-flex mb-5  flex-wrap align-items-start">
          <div className="input-group search-area d-inline-flex">
            <input type="text" className="form-control" placeholder="Search here" />            
            <span className="input-group-text c-pointer">
              <i className="flaticon-381-search-2"></i>
            </span>
            
          </div>
          <Link to="#" className="btn btn-danger ms-auto">
            DELETE
          </Link>
          <Link to="#" className="btn btn-success ms-3">
            PUBLISH
          </Link>
			  <Dropdown className="ms-3">
          <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
            <i className="flaticon-381-controls-3 me-2"></i> Filter
          </Dropdown.Toggle>

          <Dropdown.Menu className="dropdown-menu-right">
            <Dropdown.Item >A To Z List</Dropdown.Item>
            <Dropdown.Item >Z To A List</Dropdown.Item>
          </Dropdown.Menu>
			  </Dropdown>
			  <Dropdown className="ms-3">
          <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
            Newest
          </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-right">
              <Dropdown.Item >Newest</Dropdown.Item>
              <Dropdown.Item >Old</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <Tab.Container id="" defaultActiveKey="navpills-1">
              <Nav as="ul" variant="" className="nav nav-pills review-tab">
                <Nav.Item as="li" className="nav-item">
                  <Nav.Link
                    as="a"
                    eventKey="navpills-1"
                    className="nav-link c-pointer"
                  >
                    ALL REVIEW
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li" className="nav-item">
                  <Nav.Link
                    as="a"
                    eventKey="navpills-2"
                    className="nav-link c-pointer"
                  >
                    PUBLISHED
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li" className="nav-item">
                  <Nav.Link
                    as="a"
                    eventKey="navpills-3"
                    className="nav-link c-pointer"
                  >
                    DELETED
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content>
                <Tab.Pane eventKey="navpills-1">
                  <div id="navpills-1" className="tab-pane active">
                    <div className="card review-table">
                      <div className="media">
                        <div className="checkbox me-3 align-self-center">
                          <div className="custom-control custom-checkbox checkbox">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked="false"
                              id="customCheckBox1"
                              required=""
                            />
                            <label
                              className="form-check-label"
                              for="customCheckBox1"
                            ></label>
                          </div>
                        </div>
                        <img
                          src={avatar}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="fs-20 text-black font-w600 mb-3">
                            Glee Smiley
                            <span className="star-review ms-sm-3 ms-0 d-inline-block">
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-gray"></i>
                            </span>
                          </h3>
                          <p>
                            When I came with my mother, I was very nervous. But
                            after entering here I felt warmed with smiling
                          </p>
                          <span className="fs-15">
                            Sunday, 24 July 2023 04:55 PM
                          </span>
                        </div>
                        <div className="media-footer d-flex align-self-center">
                          <div className="disease me-5">
                            <p className="mb-1 fs-14">Disease</p>
                            <h4 className="text-success">Diabetes</h4>
                          </div>
                          <div className="edit ms-auto">
                            <Link to="#" className="btn btn-outline-danger">
                              DELETE
                            </Link>
                            <Link to="#" className="btn btn-outline-success ms-2">
                              PUBLISH
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card review-table">
                      <div className="media">
                        <div className="checkbox me-3 align-self-center">
                          <div className="custom-control custom-checkbox checkbox">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked="false"
                              id="customCheckBox2"
                              required=""
                            />
                            <label
                              className="form-check-label"
                              for="customCheckBox2"
                            ></label>
                          </div>
                        </div>
                        <img
                          src={avatar1}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="fs-20 text-black font-w600 mb-3">
                            Alexa Keev
                            <span className="star-review ms-sm-3 ms-0 d-inline-block">
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-gray"></i>
                            </span>
                          </h3>
                          <p>
                            When I came with my mother, I was very nervous. But
                            after entering here I felt warmed with smiling
                          </p>
                          <span className="fs-15">
                            Sunday, 24 July 2023 04:55 PM
                          </span>
                        </div>
                        <div className="media-footer d-flex align-self-center">
                          <div className="disease me-5">
                            <p className="mb-1 fs-14">Disease</p>
                            <h4 className="text-success">Dental Care</h4>
                          </div>
                          <div className="edit ms-auto">
                            <Link to="#" className="btn btn-outline-danger">
                              DELETE
                            </Link>
                            <Link to="#" className="btn btn-outline-success ms-2">
                              PUBLISH
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card review-table">
                      <div className="media">
                        <div className="checkbox me-3 align-self-center">
                          <div className="custom-control custom-checkbox checkbox ">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked="false"
                              id="customCheckBox3"
                              required=""
                            />
                            <label
                              className="form-check-label"
                              for="customCheckBox3"
                            ></label>
                          </div>
                        </div>
                        <img
                          src={avatar2}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="fs-20 text-black font-w600 mb-3">
                            Ivankov
                            <span className="star-review ms-sm-3 ms-0 d-inline-block">
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-gray"></i>
                            </span>
                          </h3>
                          <p>
                            When I came with my mother, I was very nervous. But
                            after entering here I felt warmed with smiling
                          </p>
                          <span className="fs-15">
                            Sunday, 24 July 2023 04:55 PM
                          </span>
                        </div>
                        <div className="media-footer d-flex align-self-center">
                          <div className="disease me-5">
                            <p className="mb-1 fs-14">Disease</p>
                            <h4 className="text-success">Cold & Flu</h4>
                          </div>
                          <div className="edit ms-auto">
                            <Link to="#" className="btn btn-outline-danger">
                              DELETE
                            </Link>
                            <Link to="#" className="btn btn-outline-success ms-2">
                              PUBLISH
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card review-table">
                      <div className="media">
                        <div className="checkbox me-3 align-self-center">
                          <div className="custom-control custom-checkbox checkbox">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked="false"
                              id="customCheckBox4"
                              required=""
                            />
                            <label
                              className="form-check-label"
                              for="customCheckBox4"
                            ></label>
                          </div>
                        </div>
                        <img
                          src={avatar3}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="fs-20 text-black font-w600 mb-3">
                            Axestoria Jr.
                            <span className="star-review ms-sm-3 ms-0 d-inline-block">
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-gray"></i>
                            </span>
                          </h3>
                          <p>
                            When I came with my mother, I was very nervous. But
                            after entering here I felt warmed with smiling
                          </p>
                          <span className="fs-15">
                            Sunday, 24 July 2023 04:55 PM
                          </span>
                        </div>
                        <div className="media-footer d-flex align-self-center">
                          <div className="disease me-5">
                            <p className="mb-1 fs-14">Disease</p>
                            <h4 className="text-success">Diabetes</h4>
                          </div>
                          <div className="edit ms-auto">
                            <Link to="#" className="btn btn-outline-danger">
                              DELETE
                            </Link>
                            <Link to="#" className="btn btn-outline-success ms-2">
                              PUBLISH
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="navpills-2">
                  <div id="navpills-2" className="tab-pane">
                    <div className="card review-table">
                      <div className="media">
                        <div className="checkbox me-3 align-self-center">
                          <div className="custom-control custom-checkbox checkbox ">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked="false"
                              id="customCheckBox1_2"
                              required=""
                            />
                            <label
                              className="form-check-label"
                              for="customCheckBox1_2"
                            ></label>
                          </div>
                        </div>
                        <img
                          src={avatar}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="fs-20 text-black font-w600 mb-3">
                            Glee Smiley
                            <span className="star-review ms-sm-3 ms-0 d-inline-block">
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-gray"></i>
                            </span>
                          </h3>
                          <p>
                            When I came with my mother, I was very nervous. But
                            after entering here I felt warmed with smiling
                          </p>
                          <span className="fs-15">
                            Sunday, 24 July 2023 04:55 PM
                          </span>
                        </div>
                        <div className="media-footer d-flex align-self-center">
                          <div className="disease me-5">
                            <p className="mb-1 fs-14">Disease</p>
                            <h4 className="text-success">Diabetes</h4>
                          </div>
                          <div className="edit ms-auto">
                            <Link to="#" className="btn btn-outline-danger">
                              DELETE
                            </Link>
                            <Link to="#" className="btn btn-outline-success ms-2">
                              PUBLISH
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card review-table">
                      <div className="media">
                        <div className="checkbox me-3 align-self-center">
                          <div className="custom-control custom-checkbox checkbox">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked="false"
                              id="customCheckBox2_2"
                              required=""
                            />
                            <label
                              className="form-check-label"
                              for="customCheckBox2_2"
                            ></label>
                          </div>
                        </div>
                        <img
                          src={avatar1}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="fs-20 text-black font-w600 mb-3">
                            Alexa Keev
                            <span className="star-review ms-sm-3 ms-0 d-inline-block">
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-gray"></i>
                            </span>
                          </h3>
                          <p>
                            When I came with my mother, I was very nervous. But
                            after entering here I felt warmed with smiling
                          </p>
                          <span className="fs-15">
                            Sunday, 24 July 2023 04:55 PM
                          </span>
                        </div>
                        <div className="media-footer d-flex align-self-center">
                          <div className="disease me-5">
                            <p className="mb-1 fs-14">Disease</p>
                            <h4 className="text-success">Dental Care</h4>
                          </div>
                          <div className="edit ms-auto">
                            <Link to="#" className="btn btn-outline-danger">
                              DELETE
                            </Link>
                            <Link to="#" className="btn btn-outline-success ms-2">
                              PUBLISH
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="navpills-3">
                  <div id="navpills-3" className="tab-pane">
                    <div className="card review-table">
                      <div className="media">
                        <div className="checkbox me-3 align-self-center">
                          <div className="custom-control custom-checkbox checkbox">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked="false"
                              id="customCheckBox2_1"
                              required=""
                            />
                            <label
                              className="form-check-label"
                              for="customCheckBox2_1"
                            ></label>
                          </div>
                        </div>
                        <img
                          src={avatar1}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="fs-20 text-black font-w600 mb-3">
                            Alexa Keev
                            <span className="star-review ms-sm-3 ms-0 d-inline-block">
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-gray"></i>
                            </span>
                          </h3>
                          <p>
                            When I came with my mother, I was very nervous. But
                            after entering here I felt warmed with smiling
                          </p>
                          <span className="fs-15">
                            Sunday, 24 July 2023 04:55 PM
                          </span>
                        </div>
                        <div className="media-footer d-flex align-self-center">
                          <div className="disease me-5">
                            <p className="mb-1 fs-14">Disease</p>
                            <h4 className="text-success">Dental Care</h4>
                          </div>
                          <div className="edit ms-auto">
                            <Link to="#" className="btn btn-outline-danger">
                              DELETE
                            </Link>
                            <Link to="#" className="btn btn-outline-success ms-2">
                              PUBLISH
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card review-table">
                      <div className="media">
                        <div className="checkbox me-3 align-self-center">
                          <div className="custom-control custom-checkbox checkbox ">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked="false"
                              id="customCheckBox3_1"
                              required=""
                            />
                            <label
                              className="form-check-label"
                              for="customCheckBox3_1"
                            ></label>
                          </div>
                        </div>
                        <img
                          src={avatar2}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="fs-20 text-black font-w600 mb-3">
                            Ivankov
                            <span className="star-review ms-sm-3 ms-0 d-inline-block">
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-gray"></i>
                            </span>
                          </h3>
                          <p>
                            When I came with my mother, I was very nervous. But
                            after entering here I felt warmed with smiling
                          </p>
                          <span className="fs-15">
                            Sunday, 24 July 2023 04:55 PM
                          </span>
                        </div>
                        <div className="media-footer d-flex align-self-center">
                          <div className="disease me-5">
                            <p className="mb-1 fs-14">Disease</p>
                            <h4 className="text-success">Cold & Flu</h4>
                          </div>
                          <div className="edit ms-auto">
                            <Link to="#" className="btn btn-outline-danger">
                              DELETE
                            </Link>
                            <Link to="#" className="btn btn-outline-success ms-2">
                              PUBLISH
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card review-table">
                      <div className="media">
                        <div className="checkbox me-3 align-self-center">
                          <div className="custom-control custom-checkbox checkbox ">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked="false"
                              id="customCheckBox4_1"
                              required=""
                            />
                            <label
                              className="form-check-label"
                              for="customCheckBox4_1"
                            ></label>
                          </div>
                        </div>
                        <img
                          src={avatar3}
                          className="me-3 img-fluid rounded"
                          width={110}
                          alt=""
                        />
                        <div className="media-body">
                          <h3 className="fs-20 text-black font-w600 mb-3">
                            Axestoria Jr.
                            <span className="star-review ms-sm-3 ms-0 d-inline-block">
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-orange"></i>
                              <i className="fa fa-star me-1 text-gray"></i>
                            </span>
                          </h3>
                          <p>
                            When I came with my mother, I was very nervous. But
                            after entering here I felt warmed with smiling
                          </p>
                          <span className="fs-15">
                            Sunday, 24 July 2023 04:55 PM
                          </span>
                        </div>
                        <div className="media-footer d-flex align-self-center">
                          <div className="disease me-5">
                            <p className="mb-1 fs-14">Disease</p>
                            <h4 className="text-success">Diabetes</h4>
                          </div>
                          <div className="edit ms-auto">
                            <Link to="#" className="btn btn-outline-danger">
                              DELETE
                            </Link>
                            <Link to="#" className="btn btn-outline-success ms-2">
                              PUBLISH
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
          <div className="col-xl-12">
            <div className="d-md-flex d-block text-center align-items-center mt-4">
              <p>Showing 1 from 4 data</p>
              <nav className="ms-auto">
                <ul className="pagination pagination-gutter pagination-danger mb-2">
                  <li className="page-item page-indicator">
                    <Link className="page-link" to="#">
                      <i className="la la-angle-left"></i>
                    </Link>
                  </li>
                  <li className="page-item active">
                    <Link className="page-link" to="#">
                      1
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" to="#">
                      2
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" to="#">
                      3
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" to="#">
                      4
                    </Link>
                  </li>
                  <li className="page-item page-indicator">
                    <Link className="page-link" to="#">
                      <i className="la la-angle-right"></i>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default DoctorsReview;

