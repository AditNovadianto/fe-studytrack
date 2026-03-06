import { useEffect, useState } from 'react'

interface User {
    nim_mahasiswa: string;
    nama_mahasiswa: string;
    email_mahasiswa: string;
}

interface SemesterType {
    nama_semester: string;
}

type NavbarProps = {
    activeSemester: SemesterType;
    setActiveSemester: (semester: SemesterType | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSemester, setActiveSemester }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchDataActiveSemester = async () => {
            if (!user?.nim_mahasiswa) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getActiveSemester/${user.nim_mahasiswa}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch active semester data");
                }

                const data = await response.json();

                if (data.semester) {
                    setActiveSemester(data.semester);
                } else {
                    setActiveSemester(null);
                }
            } catch (error) {
                console.error("Error fetching active semester data:", error);
            }
        };

        fetchDataActiveSemester();
    }, [user])

    return (
        <div className="w-full bg-white shadow px-8 py-4 flex justify-between items-center">
            <div className='cursor-pointer px-2 py-1 rounded-full bg-green-500 text-center text-white text-sm'>
                <p>{activeSemester?.nama_semester || "No active semester"}</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="font-semibold text-gray-700">
                        {user?.nama_mahasiswa || "User"}
                    </p>

                    <p className="text-sm text-gray-500">
                        Mahasiswa
                    </p>
                </div>

                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.nama_mahasiswa?.charAt(0) || "U"}
                </div>
            </div>
        </div>
    )
}

export default Navbar