import React, { useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
//image imported
import avatar from "../../../../images/avatar/1.jpg";
import avatar1 from "../../../../images/avatar/2.jpg";
import avatar2 from "../../../../images/avatar/3.jpg";

export default function SimpleSlider() {
  var settings = {
    dots: false,
    infinite: true,
    speed: 3000,
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrow: false,
    responsive: [
      {
        breakpoint: 1750,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  const [asd, setAsd] = useState();
  const renderArrows = () => {
    return (
      <div className="owl-nav">
        <div
          className="owl-prev disabled"
          onClick={() => asd.slickPrev()}
          style={{ zIndex: 2 }}
        >
          <i className="fa fa-caret-left" />
        </div>
        <div
          className="owl-next"
          onClick={() => asd.slickNext()}
          style={{ zIndex: 2 }}
        >
          <i className="fa fa-caret-right" />
        </div>
      </div>
    );
  };

  return (
    <div className="card-body">
      <div className="assigned-doctor owl-carousel">
        {renderArrows()}
        <Slider ref={(c) => setAsd(c)} {...settings}>
          <div className="items">
            <div className="bootstrap-media">
              <div className="media mb-4">
                <img
                  src={avatar}
                  className="me-3 img-fluid rounded"
                  width={94}
                  alt=""
                />
                <div className="media-body">
                  <h4 className="mt-0 mb-1 text-black">Dr. Inggrid A.</h4>
                  <p className="mb-1">Dentist</p>
                  <div className="star-review fs-14">
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <span className="ms-3">451 reviews</span>
                  </div>
                </div>
              </div>
              <Link to="#" className="btn btn-outline-dark me-2">
                Availability
              </Link> 
              <Link to="#" className="btn btn-danger">
                + Assign
              </Link>
            </div>
          </div>
          <div className="items">
            <div className="bootstrap-media">
              <div className="media mb-4">
                <img
                  src={avatar1}
                  className="me-3 img-fluid rounded"
                  width={94}
                  alt=""
                />
                <div className="media-body">
                  <h4 className="mt-0 mb-1 text-black">Dr. Widan Cheeh</h4>
                  <p className="mb-1">Respiratory Specialist</p>
                  <div className="star-review fs-14">
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <span className="ms-3">451 reviews</span>
                  </div>
                </div>
              </div>
              <Link to="#" className="btn btn-outline-dark me-2">
                Availability
              </Link>
              <Link to="#" className="btn btn-danger">
                + Assign
              </Link>
            </div>
          </div>
          <div className="items">
            <div className="bootstrap-media">
              <div className="media mb-4">
                <img
                  src={avatar2}
                  className="me-3 img-fluid rounded"
                  width={94}
                  alt=""
                />
                <div className="media-body">
                  <h4 className="mt-0 mb-1 text-black">Dr. Samantha</h4>
                  <p className="mb-1">Gynecologist</p>
                  <div className="star-review fs-14">
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <span className="ms-3">451 reviews</span>
                  </div>
                </div>
              </div>
              <Link to="#" className="btn btn-outline-dark me-2">
                Availability
              </Link>
              <Link to="#" className="btn btn-danger">
                + Assign
              </Link>
            </div>
          </div>
          <div className="items">
            <div className="bootstrap-media">
              <div className="media mb-4">
                <img
                  src={avatar1}
                  className="me-3 img-fluid rounded"
                  width={94}
                  alt=""
                />
                <div className="media-body">
                  <h4 className="mt-0 mb-1 text-black">Dr. Widan Cheeh</h4>
                  <p className="mb-1">Respiratory Specialist</p>
                  <div className="star-review fs-14">
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <span className="ms-3">451 reviews</span>
                  </div>
                </div>
              </div>
              <Link to="#" className="btn btn-outline-dark me-2">
                Availability
              </Link>
              <Link to="#" className="btn btn-danger">
                + Assign
              </Link>
            </div>
          </div>
          <div className="items">
            <div className="bootstrap-media">
              <div className="media mb-4">
                <img
                  src={avatar2}
                  className="me-3 img-fluid rounded"
                  width={94}
                  alt=""
                />
                <div className="media-body">
                  <h4 className="mt-0 mb-1 text-black">Dr. Samantha</h4>
                  <p className="mb-1">Gynecologist</p>
                  <div className="star-review fs-14">
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-orange"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <i className="fa fa-star me-1 text-gray"></i>
                    <span className="ms-3">451 reviews</span>
                  </div>
                </div>
              </div>
              <Link to="#" className="btn btn-outline-dark me-2">
                Availability
              </Link>
              <Link to="#" className="btn btn-danger">
                + Assign
              </Link>
            </div>
          </div>
        </Slider>
      </div>
    </div>
  );
}
