import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

const Protected = ({ children, role }) => {

    const user = useSelector((state) => state.auth.user);
    const loading = useSelector((state) => state.auth.loading);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role === "seller" && user.role !== "seller") {
        return <Navigate to="/" replace />;
    }

    if (role === "buyer" && user.role !== "buyer") {
        return <Navigate to="/seller/dashboard" replace />;
    }

    return children;
};

export default Protected;
