import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";

function HomeRedirect() {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return <Navigate to="/login" />;
    }
    try {
        const decoded = jwtDecode(token);
        if (decoded.account === "EMPLOYER") {
            return <Navigate to="/employer" />;
        } else if (decoded.account === "JOBSEEKER") {
            return <Navigate to="/jobseeker" />;
        }
    } catch {
        return <Navigate to="/login" />;
    }
    return <Navigate to="/login" />;
}

export default HomeRedirect;