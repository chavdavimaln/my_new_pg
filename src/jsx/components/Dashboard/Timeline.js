import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

import avatar from "../../../images/avatar/1.jpg";
import avatar1 from "../../../images/avatar/2.jpg";
import avatar2 from "../../../images/avatar/3.jpg";
import avatar3 from "../../../images/avatar/4.jpg";
import avatar4 from "../../../images/avatar/5.jpg";


const Timeline = () => {
  const [data, setData] = useState([
    {
      name: "Dr. Samantha Queque",
      rank: 1,
      designation: "Gynecologist",
      review: 451,
      aStar: [1, 1, 1, 0, 0],
      img: avatar,
    },
    {
      name: "Dr. Abdul Aziz Lazis",
      rank: 2,
      designation: "Physical Therapy",
      review: 238,
      aStar: [1, 1, 1, 1, 0],
      img: avatar1,
    },
    {
      name: "Dr. Samuel Jr.",
      rank: 3,
      designation: "Dentist",
      review: 300,
      aStar: [1, 1, 1, 0, 0],
      img: avatar2,
    },
    {
      name: "Dr. Alex Siauw",
      rank: 4,
      designation: "Physical Therapy",
      review: 451,
      aStar: [1, 1, 1, 0, 0],
      img: avatar3,
    },
    {
      name: "Dr. Jennifer Ruby",
      rank: 5,
      designation: "Nursingc",
      review: 700,
      aStar: [1, 1, 1, 1, 1],
      img: avatar4,
    },
  ]);
  const [refresh, setRefresh] = useState(false);

  const onClick = () => {
    setRefresh(true);
    setTimeout(() => {
      setData([
        ...data,
        data[Math.floor(Math.random() * Math.floor(data.length - 1))],
      ]);
      setRefresh(false);
    }, 1000);
  };

  return (
    <div className="card">
      <div className="card-header border-0 pb-0">
        <h4 className="card-title">Top 5 Best Doctor</h4>
        <Link className="btn-link ms-auto" to={"#"}>
          More {" >> "}
        </Link>
      </div>
      <div className="card-body">
        <div className="widget-media best-doctor">
          <div
            id="bestDoctorsContent"
            className=" dz-scroll height630"
          >
            <ul className="timeline">
              {data.map((d, i) => (
                <li key={i}>
                  <div className="timeline-panel">
                    <div className="media me-4">
                      <img src={d.img} width={90} alt="" />
                      <div className="number">#{d.rank}</div>
                    </div>
                    <div className="media-body">
                      <h4 className="mb-2">{d.name}</h4>
                      <p className="mb-2 text-primary">{d.designation}</p>
                      <div className="star-review">
                        {d.aStar.map((e, i) =>
                          e > 0 ? (
                            <Fragment key={i}>
                              <i className="fa fa-star text-orange" />{" "}
                            </Fragment>
                          ) : (
                            <Fragment key={i}>
                              <i className="fa fa-star text-gray" />{" "}
                            </Fragment>
                          )
                        )}

                        <span className="ms-3">{d.review} reviews</span>
                      </div>
                    </div>
                    <div className="social-media">
                      <Link
                        to={"#"}
                        className="btn btn-outline-primary btn-rounded me-1 btn-sm"
                      >
                        <i className="fab fa-instagram " />
                      </Link>
                      <Link
                        to={"#"}
                        className="btn btn-outline-primary btn-rounded me-1  btn-sm"
                      >
                        <i className="fab fa-twitter" />
                      </Link>
                      <Link
                        to={"#"}
                        className="btn btn-outline-primary btn-rounded me-1 btn-sm"
                      >
                        <i className="fab fa-facebook-f " />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="card-footer border-0 pt-0 text-center">
        <Link to={"#"} className="btn-link" onClick={() => onClick()}>
          See More {" >> "}
          {refresh && <i className="fa fa-refresh"></i>}
        </Link>
      </div>
    </div>
  );
};

export default Timeline;
