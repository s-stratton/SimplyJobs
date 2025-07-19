import { Navigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode";

export default function AccountProtectedRoute({ allowedAccounts, children }) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return <Navigate to="/login" />;

    let account = "";
    try {
        const decoded = jwtDecode(token);
        account = decoded.account;
    } catch {
        return <Navigate to="/login" />;
    }

    if (!allowedAccounts.includes(account)) {
        return <Navigate to="/" />;
    }

    return children;
}