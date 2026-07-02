import React, { useState, Fragment } from "react";
import TimePicker, { CurrentTimePicker } from './TimePicker';
import Gradient from "./LinearGradientPicker";
import PageTitle from "../../../layouts/PageTitle";

const Pickers = () => {
  const [colorChange, setColorChange] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: "2022-03-06",
    end: "2022-10-05",
  });
  const [dateTimeRange, setDateTimeRange] = useState({
    start: "",
    end: "",
  });
  const [singleDate, setSingleDate] = useState("");

  return (
    <Fragment>
      <PageTitle activeMenu="Pickers" motherMenu="Form" pageContent="Pickers" />
      
      <div className="row">
        <div className="col-xl-9 col-lg-8">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Date Picker</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="example rangeDatePicker">
                    <p className="mb-1">Date Range Pick</p>
                    <div className="row g-2">
                      <div className="col-sm-6">
                        <input
                          type="date"
                          className="form-control input-daterange-timepicker"
                          value={dateRange.start}
                          max={dateRange.end || undefined}
                          onChange={(e) => setDateRange((range) => ({ ...range, start: e.target.value }))}
                        />
                      </div>
                      <div className="col-sm-6">
                        <input
                          type="date"
                          className="form-control input-daterange-timepicker"
                          value={dateRange.end}
                          min={dateRange.start || undefined}
                          onChange={(e) => setDateRange((range) => ({ ...range, end: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="example rangeDatePicker">
                    <p className="mb-1">Date Range With Time</p>
                    <div className="row g-2">
                      <div className="col-sm-6">
                        <input
                          type="datetime-local"
                          className="form-control input-daterange-timepicker"
                          value={dateTimeRange.start}
                          max={dateTimeRange.end || undefined}
                          onChange={(e) => setDateTimeRange((range) => ({ ...range, start: e.target.value }))}
                        />
                      </div>
                      <div className="col-sm-6">
                        <input
                          type="datetime-local"
                          className="form-control input-daterange-timepicker"
                          value={dateTimeRange.end}
                          min={dateTimeRange.start || undefined}
                          onChange={(e) => setDateTimeRange((range) => ({ ...range, end: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div> 
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-4">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Pick-Date picker</h4>
            </div>
            <div className="card-body">
              <p className="mb-1">Default picker</p>
              <input
                type="date"
                className="form-control"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Time picker</h4>
            </div>
            <div className="card-body">
              <div className="row picker-data">			
                <div className="col-md-6 col-xl-3 col-xxl-6 mb-3">
                  <div className="color-time-picker">
                    <p className="mb-1">Complex mode</p>
                    <CurrentTimePicker />			
                  </div>
                </div> 
                  <div className="col-md-6 col-xl-3 col-xxl-6 mb-3">
                    <div className="color-time-picker style-1">
                      <p className="mb-1">Auto close Clock Picker</p>
                      <TimePicker />			
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-xxl-6 mb-3">
                    <div className="color-time-picker">
                      <p className="mb-1">Now time</p>                      
                      <TimePicker />
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-xxl-6 mb-3">
                    <div className="color-time-picker style-1">
                      <p className="mb-1">Left Placement</p>
                      <TimePicker />			
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div> 
  
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Color Picker</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-4 col-lg-6 mb-3">
                  <div className="example">
                    <p className="mb-1">Default Clock Picker</p>
                    <input
                      type="color"
                      className="as_colorpicker"                      
                      value={colorChange}
                      onChange={(e) => setColorChange(e.target.value)}
                      style={{width:"50%"}}
                    />
                  </div>
                </div>
        
                <div className="col-xl-4 col-lg-6 mb-3">
                  <div className="color-gradian-tixia">
                    <p className="mb-1">Gradiant mode</p>
                      <Gradient />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </div>
      
    </Fragment>
  );
};

export default Pickers;
