import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"

interface User {
    nim_mahasiswa: string
    nama_mahasiswa: string
    email_mahasiswa: string
}

interface SemesterType {
    id_semester: number | null
    nama_semester: string
}

type NavbarProps = {
    activeSemester: SemesterType
    setActiveSemester: (semester: SemesterType) => void
}

const Navbar: React.FC<NavbarProps> = ({ activeSemester, setActiveSemester }) => {
    const [user, setUser] = useState<User | null>(null)
    const [showProfile, setShowProfile] = useState(false)

    const profileRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) setUser(JSON.parse(storedUser))
    }, [])

    useEffect(() => {
        const fetchDataActiveSemester = async () => {
            if (!user?.nim_mahasiswa) return

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/getActiveSemester/${user.nim_mahasiswa}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                )

                const data = await response.json()

                if (data.semester) {
                    setActiveSemester(data.semester)
                } else {
                    setActiveSemester({ id_semester: null, nama_semester: "No active semester" })
                }
            } catch (error) {
                console.error("Error fetching active semester:", error)
            }
        }

        fetchDataActiveSemester()
    }, [user])

    // CLICK OUTSIDE
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleLogout = () => {
        sessionStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/")
    }

    return (
        <div className="w-full bg-white shadow-sm px-8 py-4 flex justify-between items-center relative">
            {/* Active Semester */}
            <div className="cursor-pointer px-3 py-1 rounded-full bg-green-500 text-white text-sm font-medium shadow-sm">
                {activeSemester?.nama_semester || "No active semester"}
            </div>

            {/* Profile Section */}
            <div ref={profileRef} className="relative">
                <div
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <div className="text-right">
                        <p className="font-semibold text-gray-700">
                            {user?.nama_mahasiswa || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                            Mahasiswa
                        </p>
                    </div>

                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        {user?.nama_mahasiswa?.charAt(0) || "U"}
                    </div>
                </div>

                {/* Dropdown */}
                <div
                    className={`
                        absolute right-0 mt-3 w-64 bg-white rounded-xl border border-gray-200
                        shadow-lg z-50
                        transform transition-all duration-200 ease-out
                        ${showProfile
                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
                    `}
                >
                    <div className="p-4 space-y-3">
                        <div>
                            <p className="text-xs text-gray-400">Nama Mahasiswa</p>

                            <p className="font-semibold text-gray-800">
                                {user?.nama_mahasiswa}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400">NIM Mahasiswa</p>

                            <p className="text-sm text-gray-600">
                                {user?.nim_mahasiswa}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400">Email</p>

                            <p className="text-sm text-gray-600 break-all">
                                {user?.email_mahasiswa}
                            </p>
                        </div>

                        <div className="border-t pt-3">
                            <button
                                onClick={handleLogout}
                                className="
                                    cursor-pointer w-full flex items-center justify-center
                                    bg-red-500 hover:bg-red-600
                                    text-white text-sm font-medium
                                    py-2 rounded-lg
                                    transition duration-200
                                "
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar