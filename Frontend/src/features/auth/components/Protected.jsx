import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Protected = ({ children, role = "buyer" }) => {

    const user = useSelector((state) => state.auth.user);
    const loading = useSelector((state) => state.auth.loading);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#131315] flex items-center justify-center text-white">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role === "seller" && !user.isSeller) {
        return <Navigate to="/" replace />;
    }
    return children;

}

export default Protected;