import { Navigate, Outlet } from "react-router-dom"
import { isTokenExpired } from "../utils/auth"

const ProtectedRoute = () => {
    const token = sessionStorage.getItem("token")

    if (!token) {
        return <Navigate to="/" replace />
    }

    if (isTokenExpired(token)) {
        sessionStorage.removeItem("token")
        localStorage.removeItem("user")
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default ProtectedRoute