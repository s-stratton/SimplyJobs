import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Container from './Layouts/Container';
import JobseekerHome from './pages/JobseekerHome';
import EmployerHome from './pages/EmployerHome';
import CreateJob from './pages/CreateJob';
import Applicants from './pages/Applicants';
import HomeRedirect from './pages/HomeRedirect';
import EditProfile from './pages/EditProfile';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AccountProtectedRoute from './components/AccountProtectedRoute';
import AppliedJobs from './pages/AppliedJobs';
import ProfileSetup from './pages/ProfileSetup';
import ProfileSetupRedirect from './components/ProfileSetupRedirect';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from './constants';

function RegisterAndLogout() {
    localStorage.clear();
  return <Register />;
}

function ProfileRoute() {
    const token = localStorage.getItem(ACCESS_TOKEN);
    let account = "";
    if (token) {
        try {
          const decoded = jwtDecode(token);
          account = decoded.account || "";
        } catch {}
    }

    if (account === "JOBSEEKER") {
        return (
            <AccountProtectedRoute allowedAccounts={["JOBSEEKER"]}><ProfileSetupRedirect><Profile /></ProfileSetupRedirect></AccountProtectedRoute>
        );
    }
    if (account === "EMPLOYER") {
        return (
            <AccountProtectedRoute allowedAccounts={["EMPLOYER"]}><Profile /></AccountProtectedRoute>
        );
    }
    return <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterAndLogout />} />
                <Route path="/profile-setup" element={<ProtectedRoute><AccountProtectedRoute allowedAccounts={["JOBSEEKER"]}><ProfileSetup /></AccountProtectedRoute></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
                <Route element={<Container />}>
                    <Route index element={<HomeRedirect />} />
                    <Route path="employer" element={<ProtectedRoute><AccountProtectedRoute allowedAccounts={["EMPLOYER"]}><EmployerHome /></AccountProtectedRoute></ProtectedRoute>} />
                    <Route path="create-job" element={<ProtectedRoute><AccountProtectedRoute allowedAccounts={["EMPLOYER"]}><CreateJob /></AccountProtectedRoute></ProtectedRoute>} />
                    <Route path="jobs/:jobId/applicants" element={<ProtectedRoute><AccountProtectedRoute allowedAccounts={["EMPLOYER"]}><Applicants /></AccountProtectedRoute></ProtectedRoute>} />
                    <Route path="profile/:username" element={<ProtectedRoute><ProfileRoute /></ProtectedRoute>} />
                    <Route path="jobseeker" element={<ProtectedRoute><AccountProtectedRoute allowedAccounts={["JOBSEEKER"]}><ProfileSetupRedirect><JobseekerHome /></ProfileSetupRedirect></AccountProtectedRoute></ProtectedRoute>} />
                    <Route path="profile/edit" element={<ProtectedRoute><AccountProtectedRoute allowedAccounts={["JOBSEEKER"]}><ProfileSetupRedirect><EditProfile /></ProfileSetupRedirect></AccountProtectedRoute></ProtectedRoute>} />
                    <Route path="/applied" element={<ProtectedRoute><AccountProtectedRoute allowedAccounts={["JOBSEEKER"]}><ProfileSetupRedirect><AppliedJobs /></ProfileSetupRedirect></AccountProtectedRoute></ProtectedRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App
