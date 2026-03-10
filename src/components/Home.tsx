import { useEffect, useState } from "react";
import { isTokenExpired } from "../utils/auth";
import { useNavigate } from "react-router-dom";

interface User {
    nim_mahasiswa: string;
    nama_mahasiswa: string;
    email_mahasiswa: string;
}

interface SemesterType {
    id_semester: number | null;
}

type HomeProps = {
    activeSemester: SemesterType;
}

const Home: React.FC<HomeProps> = ({ activeSemester }) => {
    const [user, setUser] = useState<User | null>(null);
    const [semester, setSemester] = useState<any[]>([]);
    const [matakuliah, setMatakuliah] = useState<any[]>([]);

    const navigate = useNavigate();

    // CHECK TOKEN EXPIRATION
    useEffect(() => {
        const token = sessionStorage.getItem("token")

        if (isTokenExpired(String(token))) {
            sessionStorage.removeItem("token")
            localStorage.removeItem("user")
            navigate("/")
        }

        return;
    }, [])
    // 

    // FETCH USER DATA
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    // 

    // FETCH DATA SEMESTER & MATAKULIAH
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

        const fetchDataMatakuliah = async () => {
            if (!user?.nim_mahasiswa) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getAllMatakuliahBySemester/${activeSemester?.id_semester}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch Matakuliah data");
                }

                const data = await response.json();

                console.log(data)

                setMatakuliah(data.matakuliah);
            } catch (error) {
                console.error("Error fetching matakuliah data:", error);
            }
        };

        fetchDataMatakuliah();
        fetchDataSemester();
    }, [user, activeSemester]);
    // 

    console.log(semester)
    console.log(matakuliah)

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
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                        <p className="text-gray-500 text-sm">Total Semester</p>
                        <h3 className="text-3xl font-bold mt-2">{semester?.length}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                        <p className="text-gray-500 text-sm">Total Matakuliah</p>
                        <h3 className="text-3xl font-bold mt-2">{matakuliah?.length}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                        <p className="text-gray-500 text-sm">Total Tasks</p>
                        <h3 className="text-3xl font-bold mt-2">12</h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                        <p className="text-gray-500 text-sm">Completed Tasks</p>
                        <h3 className="text-3xl font-bold mt-2 text-green-500">8</h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                        <p className="text-gray-500 text-sm">Pending Tasks</p>
                        <h3 className="text-3xl font-bold mt-2 text-red-500">4</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home