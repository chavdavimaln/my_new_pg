import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminPasswordReset from "./Pages/Admin/AdminPasswordReset";
import AdminProfile from "./Pages/Admin/AdminProfile";
import AdminUserDetails from "./Pages/Admin/AdminUserDetails";
import AdminUserForm from "./Pages/Admin/AdminUserForm";
import AdminUsers from "./Pages/Admin/AdminUsers";
import HistoryCenter from "./Pages/Admin/HistoryCenter";
import Dashboard from "./Pages/Dashboard/Dashboard";
import PaymentManagement from "./Pages/Payments/PaymentManagement";
import CupboardAllotment from "./Pages/Rooms/CupboardAllotment";
import OccupiedBeds from "./Pages/Rooms/OccupiedBeds";
import OccupiedRooms from "./Pages/Rooms/OccupiedRooms";
import RoomAdd from "./Pages/Rooms/RoomAdd";
import RoomDesigner from "./Pages/Rooms/RoomDesigner";
import RoomList from "./Pages/Rooms/RoomList";
import StudentAllocation from "./Pages/Rooms/StudentAllocation";
import TableAllotment from "./Pages/Rooms/TableAllotment";
import VacantBeds from "./Pages/Rooms/VacantBeds";
import VacantRooms from "./Pages/Rooms/VacantRooms";
import StudentProfiles from "./Pages/Students/StudentProfiles";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import ActionCenter from "./Pages/Requirements/ActionCenter";
import AccountingManagement from "./Pages/Requirements/AccountingManagement";
import AdmissionManagement from "./Pages/Requirements/AdmissionManagement";
import CalendarOperations from "./Pages/Requirements/CalendarOperations";
import ChatMessageCenter from "./Pages/Requirements/ChatMessageCenter";
import Inquiries from "./Pages/Requirements/Inquiries";
import InquiryTicketCenter from "./Pages/Requirements/InquiryTicketCenter";
import MaintenanceTickets from "./Pages/Requirements/MaintenanceTickets";
import PaymentOperations from "./Pages/Requirements/PaymentOperations";
import PropertyManagement from "./Pages/Requirements/PropertyManagement";
import Reports from "./Pages/Requirements/Reports";
import SettingsPanel from "./Pages/Requirements/SettingsPanel";
import StaffManagement from "./Pages/Requirements/StaffManagement";
import TransferHistory from "./Pages/Requirements/TransferHistory";
import WhatsAppAutomation from "./Pages/Requirements/WhatsAppAutomation";
import "./pgadmin.css";

const protectedPage = (component) => <ProtectedRoute>{component}</ProtectedRoute>;

const PgAdminRoutes = () => (
    <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="" element={protectedPage(<Dashboard />)} />
        <Route path="dashboard" element={<Navigate to="/pg" replace />} />
        <Route path="action-center" element={protectedPage(<ActionCenter />)} />
        <Route path="property" element={protectedPage(<PropertyManagement />)} />
        <Route path="admissions" element={protectedPage(<AdmissionManagement />)} />
        <Route path="payment-operations" element={protectedPage(<PaymentOperations />)} />
        <Route path="accounting" element={protectedPage(<AccountingManagement />)} />
        <Route path="inquiries" element={protectedPage(<Inquiries />)} />
        <Route path="tickets" element={protectedPage(<MaintenanceTickets />)} />
        <Route path="tickets/:ticketPage" element={protectedPage(<MaintenanceTickets />)} />
        <Route path="inquiries-tickets" element={protectedPage(<InquiryTicketCenter />)} />
        <Route path="messages" element={protectedPage(<ChatMessageCenter />)} />
        <Route path="calendar-operations" element={protectedPage(<CalendarOperations />)} />
        <Route path="transfers" element={protectedPage(<TransferHistory />)} />
        <Route path="reports" element={protectedPage(<Reports />)} />
        <Route path="whatsapp" element={protectedPage(<WhatsAppAutomation />)} />
        <Route path="staff" element={protectedPage(<StaffManagement />)} />
        <Route path="settings" element={protectedPage(<SettingsPanel />)} />
        <Route path="admin/profile" element={protectedPage(<AdminProfile />)} />
        <Route path="admin/users" element={protectedPage(<AdminUsers />)} />
        <Route path="admin/users/add" element={protectedPage(<AdminUserForm />)} />
        <Route path="admin/users/:id" element={protectedPage(<AdminUserDetails />)} />
        <Route path="admin/users/:id/edit" element={protectedPage(<AdminUserForm />)} />
        <Route path="admin/passwords" element={protectedPage(<AdminPasswordReset />)} />
        <Route path="admin/history" element={protectedPage(<HistoryCenter />)} />
        <Route path="rooms" element={protectedPage(<RoomList />)} />
        <Route path="rooms/add" element={protectedPage(<RoomAdd />)} />
        <Route path="rooms/designer/:id" element={protectedPage(<RoomDesigner />)} />
        <Route path="rooms/occupied" element={protectedPage(<OccupiedRooms />)} />
        <Route path="rooms/vacant" element={protectedPage(<VacantRooms />)} />
        <Route path="beds/occupied" element={protectedPage(<OccupiedBeds />)} />
        <Route path="beds/vacant" element={protectedPage(<VacantBeds />)} />
        <Route path="tables/allotment" element={protectedPage(<TableAllotment />)} />
        <Route path="cupboards/allotment" element={protectedPage(<CupboardAllotment />)} />
        <Route path="student-allocation" element={protectedPage(<StudentAllocation />)} />
        <Route path="students" element={protectedPage(<StudentProfiles />)} />
        <Route path="payments" element={protectedPage(<PaymentManagement />)} />
        <Route path="*" element={<Navigate to="/pg" replace />} />
    </Routes>
);

export default PgAdminRoutes;
