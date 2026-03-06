import { Link, useNavigate } from 'react-router-dom';
import logo from '../images/logo.png'
import { useState, useEffect } from 'react';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState({ email: false, password: false });
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

    const handleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        let hasError = false;

        if (!email) {
            setShowError(prev => ({ ...prev, email: true }));
            hasError = true;
        } else {
            setShowError(prev => ({ ...prev, email: false }));
        }

        if (!password) {
            setShowError(prev => ({ ...prev, password: true }));
            hasError = true;
        } else {
            setShowError(prev => ({ ...prev, password: false }));
        }

        if (hasError) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/signInMahasiswa`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email_mahasiswa: email,
                    password_mahasiswa: password,
                }),
            });

            console.log(response)

            if (!response.ok) {
                throw new Error("Sign In gagal");
            }

            const data = await response.json();

            sessionStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setShowToast({ show: true, status: 'success', message: "Sign In berhasil!" });

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (error) {
            console.error(error);
            setShowToast({ show: true, status: 'error', message: "Gagal melakukan sign in. Silakan coba lagi." });
        }
    };

    return (
        <div className="p-5 w-full min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 px-4">
            <img className='absolute top-5 left-5 w-32 cursor-pointer' src={logo} alt="Logo" />

            <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    Sign In
                </h1>

                <p className="text-center text-gray-500 mt-2">
                    Welcome back 👋
                </p>

                <form className="w-full mt-8 flex flex-col gap-5">
                    <div>
                        <label className="font-semibold text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setShowError(prev => ({ ...prev, email: false }));
                            }}
                        />

                        {showError.email && (
                            <p className="text-red-500 text-sm mt-1">
                                Please enter your email.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="font-semibold text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setShowError(prev => ({ ...prev, password: false }));
                            }}
                        />

                        {showError.password && (
                            <p className="text-red-500 text-sm mt-1">
                                Please enter your password.
                            </p>
                        )}

                        <Link to={"/"} className="block mt-2 text-right text-sm text-gray-500">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        onClick={(e) => handleSignIn(e)}
                        className="cursor-pointer w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Sign In
                    </button>
                </form>

                <p className='text-center mt-5 text-sm text-gray-500'>
                    Don't Have an Account?{" "}
                    <Link to={"/sign-up"} className="text-blue-500 hover:underline font-semibold">
                        Sign Up
                    </Link>
                </p>
            </div>

            {/* Toast Error or Success */}
            {showToast.show && (
                <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${showToast.status === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                    {showToast.message}
                </div>
            )}
        </div>
    );
};

export default SignIn;