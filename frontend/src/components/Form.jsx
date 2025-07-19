import { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'
import { Link } from 'react-router-dom'
import { HiOutlineEye, HiEyeOff } from "react-icons/hi";

function Form({ route, method }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [account, setAccount] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const name = method === 'login' ? 'Login' : 'Register';

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            let payload = { username, password };
            if (route !== '/api/token/') {
                payload.account = account;
            }
            const res = await api.post(route, payload);
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate('/');
            } else {
                navigate('/login');
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-svh flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8 flex flex-col gap-5"
            >
                <img
                    src="/simply_jobs_icon.png"
                    alt="Simply Jobs"
                    className="mx-auto w-14 h-14 mb-4"
                />
                <h1 className="text-3xl font-bold text-slate-800 text-center mb-4">{name}</h1>
                <input
                    className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                {route !== '/api/token/' && (
                    <>
                        <select
                            className={`appearance-none rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${account === "" ? "text-[#7f7f7f]" : "text-gray-900"}`}
                            value={account}
                            onChange={e => setAccount(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                                Account Type
                            </option>
                            <option value="JOBSEEKER">Job Seeker</option>
                            <option value="EMPLOYER">Employer</option>
                        </select>
                    </>
                )}
                <div className="relative">
                    <input
                        className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:cursor-pointer text-xl px-2 bg-transparent"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <HiEyeOff /> : <HiOutlineEye />}
                    </button>
                </div>
                <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Please wait..." : name}
                </button>
                {method === 'login' ?
                    <div className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-500 hover:underline">
                            Register
                        </Link>
                    </div>
                    :
                    <div className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-500 hover:underline">
                            Login
                        </Link>
                    </div>
                }
            </form>
        </div>
    )
}

export default Form