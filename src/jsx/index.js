import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PgAdminRoutes from "../pgadmin/PgAdminRoutes";

const Markup = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/pg/login" replace />} />
      <Route path="pg/*" element={<PgAdminRoutes />} />
      <Route path="*" element={<Navigate to="/pg/login" replace />} />
    </Routes>
  );
};

export default Markup;
