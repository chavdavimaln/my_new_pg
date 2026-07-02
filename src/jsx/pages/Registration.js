import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const [registrationData, setRegistrationData] = useState({});
    const handleBlur = (e) => {
        const newRegistrationData = { ...registrationData };
        newRegistrationData[e.target.name] = e.target.value;
        setRegistrationData(newRegistrationData);
    };
    const nav = useNavigate();
    const submitHandler = (e) => {
        e.preventDefault();
        nav("/");
    };
    return (
        <div className="authincation">
            <div className="container">
                <div className="row justify-content-center h-100 align-items-center">
                    <div className="col-md-6">
                        <div className="authincation-content">
                            <div className="row no-gutters">
                                <div className="col-xl-12">
                                    <div className="auth-form">
                                        <h4 className="text-center mb-4">
                                            Sign up your account
                                        </h4>
                                        <form
                                            action=""
                                            onSubmit={(e) => submitHandler(e)}
                                        >
                                            <div className="form-group">
                                                <label className="mb-1">
                                                    <strong>Username</strong>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="username"
                                                    name="name"
                                                    onChange={handleBlur}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="mb-1">
                                                    <strong>Email</strong>
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="hello@example.com"
                                                    name="Email"
                                                    onChange={handleBlur}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="mb-1">
                                                    <strong>Password</strong>
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    defaultValue="Password"
                                                    name="password"
                                                    onChange={handleBlur}
                                                />
                                            </div>
                                            <div className="text-center mt-4">
                                                <input
                                                    type="submit"
                                                    value=" Sign me up"
                                                    className="btn btn-primary btn-block"
                                                />
                                            </div>
                                        </form>
                                        <div className="new-account mt-3">
                                            <p>
                                                Already have an account?{" "}
                                                <Link
                                                    className="text-primary"
                                                    to="/page-login"
                                                >
                                                    Sign in
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
