import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
/// Scroll
// import PerfectScrollbar from "react-perfect-scrollbar";

/// Image
// import profile from "../../../images/profile/17.jpg";  
import profile2 from "../../../images/profile/pic1.jpg";
import avatar from "../../../images/avatar/1.jpg";
import { useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
// import { set } from "date-fns/esm";



const Header = ({ onNote }) => {
    const [fullScreen, setFullScreen] = useState(false);
    const {background, changeBackground} = useContext(ThemeContext);
    function handelChangeMode(){
      if(background.value==="light"){
          changeBackground({ value: "dark", label: "Dark" });  
      }
      else {
        changeBackground({ value: "light", label: "Light" });  
      }
    }
  
    let path = window.location.pathname.split("/");
    let name = path[path.length - 1].split("-");
    let filterName = name.length >= 3 ? name.filter((n, i) => i > 0) : name;
    let finalName = filterName.includes("app")
      ? filterName.filter((f) => f !== "app")
      : filterName.includes("ui")
      ? filterName.filter((f) => f !== "ui")
      : filterName.includes("uc")
      ? filterName.filter((f) => f !== "uc")
      : filterName.includes("basic")
      ? filterName.filter((f) => f !== "basic")
      : filterName.includes("form")
      ? filterName.filter((f) => f !== "form")
      : filterName.includes("table")
      ? filterName.filter((f) => f !== "table")
      : filterName.includes("page")
      ? filterName.filter((f) => f !== "page")
      : filterName.includes("email")
      ? filterName.filter((f) => f !== "email")
      : filterName.includes("ecom")
      ? filterName.filter((f) => f !== "ecom")
      : filterName.includes("chart")
      ? filterName.filter((f) => f !== "chart")
      : filterName.includes("editor")
      ? filterName.filter((f) => f !== "editor")
      : filterName;
     

  const onFullScreen = () => {
    var elem = document.documentElement;
    setFullScreen(elem ? true : false);

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };
  const offFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }
    setFullScreen(false);
  };

  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
              <div
                className="dashboard_bar"
                style={{ textTransform: "capitalize" }}
              >
                {finalName.join(" ").length === 0
                  ? "Dashboard"
                  : finalName.join(" ") === "dashboard dark"
                  ? "Dashboard"
                  : finalName.join(" ")}
              </div>
            </div>

            <ul className="navbar-nav header-right"> 
                <li className="nav-item dropdown notification_dropdown">
                  <Link to={"#"} className={`nav-link bell dz-theme-mode ${ background.value === "dark" ? "active": ""}`}
                    onClick={handelChangeMode}
                  >
									  <i id="icon-light" className="fas fa-sun"/>
                    <i id="icon-dark" className="fas fa-moon" />									
                  </Link>
							  </li>
              {fullScreen ? (
                <li
                  className="nav-item dropdown notification_dropdown"
                  onClick={() => offFullScreen()}
                >
                  <Link className="nav-link dz-fullscreen active" to={"#"}>
                    <svg
                      id="icon-full"
                      viewBox="0 0 24 24"
                      width={26}
                      height={26}
                      stroke="currentColor"
                      strokeWidth={2}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="css-i6dzq1"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                    <svg
                      id="icon-minimize"
                      width={26}
                      height={26}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-minimize"
                    >
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                  </Link>
                </li>
              ) : (
                <li className="nav-item dropdown notification_dropdown">
                  <Link
                    className="nav-link dz-fullscreen"
                    to="#"
                    onClick={() => onFullScreen()}
                  >
                    <svg
                      id="icon-full"
                      viewBox="0 0 24 24"
                      width={26}
                      height={26}
                      stroke="currentColor"
                      strokeWidth={2}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="css-i6dzq1"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                    <svg
                      id="icon-minimize"
                      width={26}
                      height={26}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-minimize"
                    >
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                  </Link>
                </li>
              )}
              <li className="nav-item dropdown notification_dropdown">
                <Link
                  className="nav-link bell bell-link"
                  to="#"
                  onClick={() => onNote()}
                >
                  <div className="">
                    <i className="flaticon-381-pad"></i>
                  </div>
                 
                </Link>
              </li>
              
              <li className="nav-item dropdown notification_dropdown">
                <Dropdown className="no-carat transparrent">
                  <Dropdown.Toggle
                    variant=""
                    id="dropdown-basic"
                    className="nav-link  ai-icon i-false"
                  >
                    <div className="">
                      <i className="flaticon-381-ring"></i>
                      <div className="pulse-css"></div>
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu dropdown-menu-right" align="end">
                    <div className="deznav-scroll">
                      <div
                        id="DZ_W_Notification1"
                        className="widget-media dz-scroll p-3"
                        style={{ height: "380px" }}
                      >
                        <ul className="timeline">
                          <li>
                            <div className="timeline-panel">
                              <div className="media me-2">
                                <img src={avatar} width={50} alt="" />
                              </div>
                              <div className="media-body">
                                <h6 className="mb-1">
                                  Dr sultadsss Send you Photo
                                </h6>
                                <small className="d-block">
                                  29 July 2023 - 02:26 PM
                                </small>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="timeline-panel">
                              <div className="media me-2 media-info">KG</div>
                              <div className="media-body">
                                <h6 className="mb-1">
                                  Resport created successfully
                                </h6>
                                <small className="d-block">
                                  29 July 2023 - 02:26 PM
                                </small>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="timeline-panel">
                              <div className="media me-2 media-success">
                                <i className="fa fa-home"></i>
                              </div>
                              <div className="media-body">
                                <h6 className="mb-1">Reminder : Treatment Time!</h6>
                                <small className="d-block">
                                  29 July 2023 - 02:26 PM
                                </small>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="timeline-panel">
                              <div className="media me-2">
                                <img src={avatar} width={50} alt="" />
                              </div>
                              <div className="media-body">
                                <h6 className="mb-1">Dr sultads Send you Photo</h6>
                                <small className="d-block">
                                  29 July 2023 - 02:26 PM
                                </small>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="timeline-panel">
                              <div className="media me-2 media-danger">KG</div>
                              <div className="media-body">
                                <h6 className="mb-1">
                                  Resport created successfully
                                </h6>
                                <small className="d-block">
                                  29 July 2023 - 02:26 PM
                                </small>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="timeline-panel">
                              <div className="media me-2 media-primary">
                                <i className="fa fa-home"></i>
                              </div>
                              <div className="media-body">
                                <h6 className="mb-1">Reminder : Treatment Time!</h6>
                                <small className="d-block">
                                  29 July 2023 - 02:26 PM
                                </small>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <Link className="all-notification" to={"#"}>
                      See all notifications <i className="ti-arrow-right"></i>
                    </Link>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
              <Dropdown as="li" className="nav-item dropdown header-profile">
                <Dropdown.Toggle
                  as={Link}
                  variant=""
                  className="nav-link i-false"
                  to="#"                  
                >
                  <div className="header-info">
                    <span>David Morse</span>
                    <small>ADMIN</small>
                  </div>
                  <img src={profile2} width={20} alt="" />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  align="end"
                  className="dropdown-menu dropdown-menu-right"
                >
                  <Link to="/app-profile" className="dropdown-item ai-icon">
                    <svg
                      id="icon-user1"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-primary"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx={12} cy={7} r={4} />
                    </svg>
                    <span className="ms-2">Profile </span>
                  </Link>
                  <Link to="/email-inbox" className="dropdown-item ai-icon">
                    <svg
                      id="icon-inbox"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-success"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span className="ms-2">Inbox </span>
                  </Link>
                  <Link to="/page-login" className="dropdown-item ai-icon">
                    <svg
                      id="icon-logout"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-danger"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1={21} y1={12} x2={9} y2={12} />
                    </svg>
                    <span className="ms-2">Logout </span>
                  </Link>
                </Dropdown.Menu>
              </Dropdown>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;

