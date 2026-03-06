import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../images/logo.png";

const SignUp = () => {
    const [form, setForm] = useState({
        nim: "",
        name: "",
        email: "",
        status: "ACTIVE",
        password: "",
        confirmPassword: ""
    });

    const [showError, setShowError] = useState({
        nim: false,
        name: false,
        email: false,
        status: false,
        password: false,
        confirmPassword: false
    });

    const [showToast, setShowToast] = useState({ show: false, status: '', message: '' });

    const navigate = useNavigate();

    useEffect(() => {
        if (showToast.show && showToast.status === 'error') {
            const timer = setTimeout(() => {
                setShowToast({ show: false, status: '', message: '' });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

        setShowError((prev) => ({
            ...prev,
            [name]: false
        }));
    };

    const handleSignUp = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const errors = {
            nim: !form.nim,
            name: !form.name,
            email: !form.email,
            status: !form.status,
            password: !form.password,
            confirmPassword: !form.confirmPassword || form.password !== form.confirmPassword
        };

        setShowError(errors);

        const hasError = Object.values(errors).some((v) => v);

        if (hasError) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/signUpMahasiswa`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nim_mahasiswa: form.nim,
                    nama_mahasiswa: form.name,
                    email_mahasiswa: form.email,
                    password_mahasiswa: form.password,
                    status_mahasiswa: form.status
                }),
            });

            console.log(response)

            if (!response.ok) {
                throw new Error("Sign Up gagal");
            }

            setShowToast({ show: true, status: 'success', message: "Sign Up berhasil!" });

            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (error) {
            console.error(error);
            setShowToast({ show: true, status: 'error', message: "Gagal melakukan sign up. Silakan coba lagi." });
        }
    };

    return (
        <div className="p-5 w-full min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 px-4">
            <img
                className="absolute top-5 left-5 w-32 cursor-pointer"
                src={logo}
                alt="Logo"
            />

            <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    Sign Up
                </h1>

                <p className="text-center text-gray-500 mt-2">
                    Create your account ✨
                </p>

                <form className="w-full mt-8 flex flex-col gap-5">
                    {/* NIM */}
                    <div>
                        <label className="font-semibold text-gray-700">NIM</label>

                        <input
                            type="text"
                            name="nim"
                            placeholder="Enter your NIM"
                            className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={form.nim}
                            onChange={handleChange}
                        />

                        {showError.nim && (
                            <p className="text-red-500 text-sm mt-1">
                                Please enter your NIM.
                            </p>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="font-semibold text-gray-700">Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={form.name}
                            onChange={handleChange}
                        />

                        {showError.name && (
                            <p className="text-red-500 text-sm mt-1">
                                Please enter your name.
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="font-semibold text-gray-700">Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={form.email}
                            onChange={handleChange}
                        />

                        {showError.email && (
                            <p className="text-red-500 text-sm mt-1">
                                Please enter your email.
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="font-semibold text-gray-700">Status</label>

                        <select
                            name="status"
                            className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="font-semibold text-gray-700">Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={form.password}
                            onChange={handleChange}
                        />

                        {showError.password && (
                            <p className="text-red-500 text-sm mt-1">
                                Please enter your password.
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="font-semibold text-gray-700">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />

                        {showError.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                Passwords do not match.
                            </p>
                        )}
                    </div>

                    <button
                        onClick={(e) => handleSignUp(e)}
                        className="cursor-pointer w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-5">
                    Already have an account?{" "}
                    <Link to="/" className="text-blue-600 hover:underline font-semibold">
                        Sign In
                    </Link>
                </p>
            </div>

            {/* Toast Error */}
            {showToast.show && (
                <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${showToast.status === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                    {showToast.message}
                </div>
            )}
        </div>
    );
};

export default SignUp;