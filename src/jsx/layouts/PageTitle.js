import React from "react";
import {Link} from 'react-router-dom';
import { Breadcrumb } from "react-bootstrap";

const PageTitle = ({ motherMenu, activeMenu }) => {
   return (     
      <div className="row page-titles">         
         <Breadcrumb className="ps-0">
            <Breadcrumb.Item>
               <Link to={"#"}>{motherMenu}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
               <Link to={"#"}>{activeMenu}</Link>
            </Breadcrumb.Item>
         </Breadcrumb>         
        
      </div>
   );
};

export default PageTitle;
