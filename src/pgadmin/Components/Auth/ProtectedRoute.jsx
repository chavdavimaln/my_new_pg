import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentAdmin, getRoutePrivilege, hasPrivilege } from "../../Utils/adminAuth";
import { pgPath } from "../../Utils/pgBrand";

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const admin = getCurrentAdmin();

    if (!admin) {
        return <Navigate to={pgPath("/login")} replace state={{ from: location.pathname }} />;
    }

    const privilege = getRoutePrivilege(location.pathname);
    if (!hasPrivilege(admin, privilege)) {
        return <Navigate to={pgPath()} replace />;
    }

    return children;
};

export default ProtectedRoute;
