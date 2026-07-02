import React,{useReducer} from 'react';
import { Modal } from 'react-bootstrap';
import {Link} from 'react-router-dom';

const flaticonData = [
    {iconName: "flaticon-381-add" },
    {iconName: "flaticon-381-add-1" },
    {iconName: "flaticon-381-add-2" },
    {iconName: "flaticon-381-add-3" },
    {iconName: "flaticon-381-alarm-clock" },
    {iconName: "flaticon-381-alarm-clock-1" },
    {iconName: "flaticon-381-album" },
    {iconName: "flaticon-381-album-1" },
    {iconName: "flaticon-381-album-2" },
    {iconName: "flaticon-381-album-3" },
    {iconName: "flaticon-381-archive" },
    {iconName: "flaticon-381-back" },
    {iconName: "flaticon-381-back-1" },
    {iconName: "flaticon-381-back-2" },
    {iconName: "flaticon-381-background" },
    {iconName: "flaticon-381-background-1" },
    {iconName: "flaticon-381-bluetooth" },
    {iconName: "flaticon-381-bluetooth-1" },
    {iconName: "flaticon-381-book" },
    {iconName: "flaticon-381-bookmark" },
    {iconName: "flaticon-381-bookmark-1" },
    {iconName: "flaticon-381-box" },
    {iconName: "flaticon-381-box-1" },
    {iconName: "flaticon-381-box-2" },
    {iconName: "flaticon-381-briefcase" },
    {iconName: "flaticon-381-broken-heart" },
    {iconName: "flaticon-381-broken-link" },
    {iconName: "flaticon-381-calculator" },
    {iconName: "flaticon-381-calculator-1" },
    {iconName: "flaticon-381-calendar" },
    {iconName: "flaticon-381-calendar-2" },
    {iconName: "flaticon-381-calendar-3" },
    {iconName: "flaticon-381-calendar-4" },
    {iconName: "flaticon-381-calendar-5" },
    {iconName: "flaticon-381-calendar-6" },
    {iconName: "flaticon-381-calendar-7" },
    {iconName: "flaticon-381-clock" },
    {iconName: "flaticon-381-clock-1" },
    {iconName: "flaticon-381-clock-2" },
    {iconName: "flaticon-381-close" },
    {iconName: "flaticon-381-cloud" },
    {iconName: "flaticon-381-cloud-computing" },
    {iconName: "flaticon-381-command" },
    {iconName: "flaticon-381-compact-disc" },
    {iconName: "flaticon-381-compact-disc-1" },
    {iconName: "flaticon-381-compact-disc-2" },
    {iconName: "flaticon-381-compass" },
    {iconName: "flaticon-381-compass-1" },
    {iconName: "flaticon-381-compass-2" },
    {iconName: "flaticon-381-controls" },
    {iconName: "flaticon-381-controls-1" },
    {iconName: "flaticon-381-controls-2" },
    {iconName: "flaticon-381-controls-3" },
    {iconName: "flaticon-381-controls-4" },
    {iconName: "flaticon-381-controls-5" },
    {iconName: "flaticon-381-controls-6" },
    {iconName: "flaticon-381-controls-7" },
    {iconName: "flaticon-381-controls-8" },
    {iconName: "flaticon-381-controls-9" },
    {iconName: "flaticon-381-database" },
    {iconName: "flaticon-381-database-1" },
    {iconName: "flaticon-381-database-2" },
    {iconName: "flaticon-381-diamond" },
    {iconName: "flaticon-381-diploma" },
    {iconName: "flaticon-381-dislike" },
    {iconName: "flaticon-381-divide" },
    {iconName: "flaticon-381-division" },
    {iconName: "flaticon-381-division-1" },
    {iconName: "flaticon-381-download" },
    {iconName: "flaticon-381-earth-globe" },
    {iconName: "flaticon-381-earth-globe-1" },
    {iconName: "flaticon-381-edit" },
    {iconName: "flaticon-381-edit-1" },
    {iconName: "flaticon-381-eject" },
    {iconName: "flaticon-381-eject-1" },
    {iconName: "flaticon-381-enter" },
    {iconName: "flaticon-381-equal" },
    {iconName: "flaticon-381-equal-1" },
    {iconName: "flaticon-381-equal-2" },
    {iconName: "flaticon-381-error" },
    {iconName: "flaticon-381-exit" },
    {iconName: "flaticon-381-exit-1" },
    {iconName: "flaticon-381-exit-2" },
    {iconName: "flaticon-381-fast-forward" },
    {iconName: "flaticon-381-fast-forward-1" },
    {iconName: "flaticon-381-file" },
    {iconName: "flaticon-381-file-1" },
    {iconName: "flaticon-381-file-2" },
    {iconName: "flaticon-381-background-1" },
    {iconName: "flaticon-381-battery" },
    {iconName: "flaticon-381-battery-1" },
    {iconName: "flaticon-381-battery-2" },
    {iconName: "flaticon-381-battery-3" },
    {iconName: "flaticon-381-battery-4" },
    {iconName: "flaticon-381-battery-5" },
    {iconName: "flaticon-381-battery-6" },
    {iconName: "flaticon-381-battery-7" },
    {iconName: "flaticon-381-battery-8" },
    {iconName: "flaticon-381-battery-9" },
    {iconName: "flaticon-381-paperclip" },
    {iconName: "flaticon-381-binoculars" },
    {iconName: "flaticon-381-blueprint" },
    

];

const initialState = false;
const reducer = (state, action) =>{   
	switch (action.type){
		case 'flatModal':
			return { ...state, flatModal: !state.flatModal, content : action.content}			
		default:
			return state
	}	
}

const FlatIcon = () => {    
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <>
            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item "><Link to={"#"}>Icons</Link></li>
                    <li className="breadcrumb-item active"><Link to={"#"}>Flaticon</Link></li>
                </ol>
            </div>   
            <div className="row">
                <div className="col-xl-12">
                    <div className="card">
                        <div className="card-header"> <h4 className='card-title'> Flaticon Icons</h4></div>
                        <div className="card-body pb-2 svg-area px-3">
                            <div className="row">
                                {flaticonData.map((item, ind)=>(
                                    <div className="col-xl-2 col-lg-3 col-xxl-3 col-md-4 col-sm-6 col-12" key={ind}>
                                        <div className="svg-icons-ov style-1" 
                                            onClick={() => dispatch({type:'flatModal', content: item.iconName})}
                                            >
                                            <div className="svg-icons-prev">
                                                <i className={item.iconName} />
                                            </div>
                                            <div className="svg-classname">{item.iconName}</div>                                                                        
                                        </div>
                                    </div>
                                ))}
                            </div>   
                        </div>
                    </div>
                </div>
            </div>            
            <Modal className="modal fade" centered show={state.flatModal} onHide={()=>dispatch({type:'flatModal'})}>               
                <div className="modal-header">
                    <h5 className="modal-title" id="svg_img_label_Brassieresvg">{state.content}</h5>
                    <button type="button" className="btn-close"  onClick={() => dispatch({type:'flatModal'})} />
                </div>
                <div className="modal-body">
                    <pre>
{`
<i className="${state.content}"/>;
`}
                    </pre>                            
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => dispatch({type:'flatModal'})}>Close</button>
                </div>
            </Modal>
        </>
    );
};

export default FlatIcon;