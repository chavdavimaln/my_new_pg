import React, { Fragment, useContext } from "react";
import { useDispatch , useSelector } from 'react-redux';
import { navtoggle } from "../../../store/actions/AuthActions";

/// React router dom
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import logoTextWhite from "../../../images/logo-text-white.png";
import logoText from "../../../images/logo-text.png";
import logoWhite from "../../../images/logo-white.png";
/// images
import logo from "../../../images/logo.png";

const NavHader = () => {
    const dispatch = useDispatch();
    const sideMenu = useSelector(state => state.sideMenu);
    const handleToogle = () => {
       dispatch(navtoggle());
    };
  const { navigationHader, openMenuToggle, background } = useContext(
    ThemeContext
  );
  return (
    <div className="nav-header">
      <Link to="/" className="brand-logo">
        {background.value === "dark" || navigationHader !== "color_1" ? (
          <Fragment>
            <img className="logo-abbr" src={logoWhite} alt="" />
            <img className="logo-compact" src={logoTextWhite} alt="" />
            <img className="brand-title" src={logoTextWhite} alt="" />
          </Fragment>
        ) : (
          <Fragment>
            <img className="logo-abbr" src={logo} alt="" />
            <img className="logo-compact" src={logoText} alt="" />
            <img className="brand-title" src={logoText} alt="" />
          </Fragment>
        )}
      </Link>

      <div
        className="nav-control"
        onClick={() => {
          // setToggle(!toggle);
          handleToogle()
          openMenuToggle();
        }}
      >
        <div className={`hamburger ${sideMenu ? "is-active" : ""}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </div>
    </div>
  );
};

export default NavHader;
