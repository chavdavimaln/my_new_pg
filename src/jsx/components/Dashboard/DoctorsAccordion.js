import React, { Fragment } from "react";
import { Link } from 'react-router-dom';
import { Row, Col, Accordion } from "react-bootstrap";

//import Images:
import avatar from "../../../images/avatar/1.jpg";
import avatar1 from "../../../images/avatar/2.jpg";
import avatar2 from "../../../images/avatar/3.jpg";
import avatar3 from "../../../images/avatar/4.jpg";
import avatar4 from "../../../images/avatar/5.jpg";

const accordtionData = [
	{
		title:'A',
		number:'5',	
		subcontent : [
			{ image: avatar, name:'Dr. Samantha Queque', subtitle:'Gynecologist', star:0, review:'451'},
			{ image: avatar1, name:'Dr. Abdul Aziz Lazis', subtitle:'Physical Therapy', star:'', review:'201'},
			{ image: avatar2, name:'Dr. Samuel Jr.', subtitle:'Dentist', star:'', review:'356'},
			{ image: avatar3, name:'Dr. Alex Siauw', subtitle:'Physical Therapy',star:0,  review:'123'},
			{ image: avatar4, name:'Dr. Jennifer Ruby', subtitle:'Nursingc', star:'', review:'650'},
		],
	},
	{
		title:'B',
		number:'3',	
		subcontent : [			
			{ image: avatar1, name:'Dr. Abdul Aziz Lazis', subtitle:'Physical Therapy', star:'', review:'400'},
			{ image: avatar2, name:'Dr. Samuel Jr.', subtitle:'Dentist', star:'', review:'340'},
			{ image: avatar3, name:'Dr. Alex Siauw', subtitle:'Physical Therapy',star:0,  review:'330'},

		],
	},
	{
		title:'C',
		number:'2',	
		subcontent : [		
			{ image: avatar2, name:'Dr. Samuel Jr.', subtitle:'Dentist', star:'', review:'120'},			
			{ image: avatar4, name:'Dr. Jennifer Ruby', subtitle:'Nursingc', star:'', review:'320'},
		],
	}
	
];

const UiAccordion = () => {
   return (
      <Fragment>
         <Row>
            <Col xl="col-xl-12 col-12">  
				<Accordion className="accordion doctor-list accort-doctor" defaultActiveKey="0" >					
					{accordtionData.map((data, ind)=>(
						<Accordion.Item className="accordion-item" eventKey={`${ind}`} key={ind}>
							<Accordion.Header className="accordion_header rounded-lg">
								<span className="accordion__header-alphabet">{data.title}</span>
								<span className="accordion__header-line flex-grow-1"></span>
								<span className="accordion__header--text">{data.number} Doctors</span>
							</Accordion.Header>
							<Accordion.Collapse eventKey={`${ind}`}>
								<div className="widget-media best-doctor pt-4">
									<div className="timeline row">
										{data.subcontent.map((item, index)=>(									
											<div className="col-lg-6" key={index}>
												<div className="timeline-panel bg-white p-4 mb-4">
													<div className="media me-4">
														<img src={item.image} width={90} alt="" />
													</div>
													<div className="media-body">
														<h4 className="mb-2">{item.name}</h4>
														<p className="mb-2 text-primary">{item.subtitle}</p>													
														{item.star === 0 ? 
															<div className="star-review">
																<i className="fa fa-star text-orange me-1"/>
																<i className="fa fa-star text-orange me-1"/>
																<i className="fa fa-star text-orange me-1"/>
																<i className="fa fa-star text-gray me-1" />
																<i className="fa fa-star text-gray me-1"/>
																<span className="ms-3">{item.review} reviews</span>
															</div>
															:
															<div className="star-review"> 
																<i className="fa fa-star text-orange me-1"></i>
																<i className="fa fa-star text-orange me-1"></i>
																<i className="fa fa-star text-orange me-1"></i>
																<i className="fa fa-star text-orange me-1"></i>
																<i className="fa fa-star text-orange " />
																<span className="ms-3">{item.review} reviews</span>
															</div>
														}
														
														
													</div>
													<div className="social-media">
														<Link to={"#"} className="btn btn-outline-primary btn-rounded btn-sm me-1">
															<i className="fab fa-instagram" />
														</Link>
														<Link to={"#"} className="btn btn-outline-primary btn-rounded  btn-sm me-1">
															<i className="fab fa-twitter" />
														</Link>
														<Link to={"#"} className="btn btn-outline-primary btn-rounded btn-sm me-1">
															<i className="fab fa-facebook-f" />
														</Link>
													</div>
												</div>
											</div>
										))}									
									</div>
								</div>
							</Accordion.Collapse>
						</Accordion.Item>					
					))}           
				</Accordion>               
            </Col>
            {/* <!-- Column ends --> */}
         </Row>{" "}
      </Fragment>
   );
};

export default UiAccordion;
