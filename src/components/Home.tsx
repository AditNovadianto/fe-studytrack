import { useEffect, useState } from "react";
import { isTokenExpired } from "../utils/auth";
import { useNavigate } from "react-router-dom";

interface User {
    nim_mahasiswa: string;
    nama_mahasiswa: string;
    email_mahasiswa: string;
}

const Home = () => {
    const [user, setUser] = useState<User | null>(null);
    const [semester, setSemester] = useState<any[]>([]);
    const [matakuliah, setMatakuliah] = useState(null);
    const [pertemuan, setPertemuan] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token")

        if (isTokenExpired(String(token))) {
            sessionStorage.removeItem("token")
            localStorage.removeItem("user")
            navigate("/")
        }

        return
    }, [])

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchDataSemester = async () => {
            if (!user?.nim_mahasiswa) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getAllSemesterByNim/${user.nim_mahasiswa}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch semester data");
                }

                const data = await response.json();

                setSemester(data.semester);
            } catch (error) {
                console.error("Error fetching semester data:", error);
            }
        };

        fetchDataSemester();
    }, [user]);

    console.log(semester)

    return (
        <div className="flex-1">
            {/* Content */}
            <div className="p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Welcome back, {user?.nama_mahasiswa || "Student"} 👋
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Track your tasks, classes, and progress today.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                        <p className="text-gray-500 text-sm">Total Semester</p>
                        <h3 className="text-3xl font-bold mt-2">{semester?.length}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                        <p className="text-gray-500 text-sm">Total Tasks</p>
                        <h3 className="text-3xl font-bold mt-2">12</h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                        <p className="text-gray-500 text-sm">Completed Tasks</p>
                        <h3 className="text-3xl font-bold mt-2 text-green-500">8</h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                        <p className="text-gray-500 text-sm">Pending Tasks</p>
                        <h3 className="text-3xl font-bold mt-2 text-red-500">4</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home