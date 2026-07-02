// pgadmin/src/Components/Layout/AdminLayout.jsx

import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        // Programmed admin shell: every protected page should render inside this layout.
        <div className="pg-app-shell flex overflow-x-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
                <Header setSidebarOpen={setSidebarOpen} />

                {/* Section container: page JSX goes here and inherits the theme spacing/background. */}
                <main className="pg-main min-w-0">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default AdminLayout;
