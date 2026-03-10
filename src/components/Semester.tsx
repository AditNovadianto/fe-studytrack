import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";

interface User {
    nim_mahasiswa: string;
    nama_mahasiswa: string;
    email_mahasiswa: string;
}

interface SemesterType {
    id_semester: number | null;
    nama_semester: string;
}

interface SemesterTypeComponent extends SemesterType {
    status_semester: string;
    academic_year: string;
}

type SemesterProps = {
    setActiveSemester: (semester: SemesterType) => void;
}

const Semester: React.FC<SemesterProps> = ({ setActiveSemester }) => {
    const [semesters, setSemesters] = useState<SemesterTypeComponent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [semesterName, setSemesterName] = useState("");
    const [semesterStatus, setSemesterStatus] = useState("INACTIVE");
    const [academicYear, setAcademicYear] = useState("");
    const [editId, setEditId] = useState<number | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [showToast, setShowToast] = useState({ show: false, status: '', message: '' });
    const [showConfirmDelete, setShowConfirmDelete] = useState({ show: false, id: 0 });

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

    // TIMEOUT FOR TOAST
    useEffect(() => {
        if (showToast.show && showToast.status === 'error' || showToast.status === 'success') {
            const timer = setTimeout(() => {
                setShowToast({ show: false, status: '', message: '' });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);
    // 

    // FETCH DATA SEMESTER & ACTIVE SEMESTER
    useEffect(() => {
        const fetchDataSemester = async () => {
            if (!user?.nim_mahasiswa) return;

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/getAllSemesterByNim/${user.nim_mahasiswa}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch semester data");
                }

                const data = await response.json();

                setSemesters(data.semester);
            } catch (error) {
                console.error("Error fetching semester data:", error);
            }
        };

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
                    setActiveSemester({ id_semester: null, nama_semester: "No active semester" });
                }
            } catch (error) {
                console.error("Error fetching active semester data:", error);
            }
        };

        fetchDataActiveSemester();
        fetchDataSemester();
    }, [user, showModal, showConfirmDelete]);
    // 

    // OPEN ADD, EDIT MODAL
    const openAddModal = () => {
        setEditId(null)
        setSemesterName("")
        setSemesterStatus("INACTIVE")
        setAcademicYear("")
        setShowModal(true)
    }

    const openEditModal = (semester: SemesterTypeComponent) => {
        setEditId(semester.id_semester)
        setSemesterName(semester.nama_semester)
        setSemesterStatus(semester.status_semester)
        setAcademicYear(semester.academic_year)
        setShowModal(true)
    }
    // 

    // HANDLE ADD, UPDATE, DELETE
    const handleUpdate = async () => {
        if (!editId) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/updateSemester/${editId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        nim_mahasiswa: user?.nim_mahasiswa,
                        nama_semester: semesterName,
                        status_semester: semesterStatus,
                        academic_year: academicYear
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update semester data");
            }

            setShowModal(false);
            setEditId(null);

            setShowToast({ show: true, status: 'success', message: "Semester updated successfully!" });
        } catch (error) {
            console.error("Error updating semester data:", error);
            setShowToast({ show: true, status: 'error', message: "Failed to update semester. Please check if the another semester status is active." });
        }
    }

    const handleAdd = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/createSemester`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        nim_mahasiswa: user?.nim_mahasiswa,
                        nama_semester: semesterName,
                        status_semester: semesterStatus,
                        academic_year: academicYear
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create semester data");
            }

            setShowModal(false);

            setShowToast({ show: true, status: 'success', message: "Semester added successfully!" });
        } catch (error) {
            console.error("Error creating semester data:", error);
            setShowToast({ show: true, status: 'error', message: "Failed to add semester. Please check if the another semester status is active." });
        }
    }

    const handleDelete = async (id_semester: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/deleteSemester/${id_semester}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        nim_mahasiswa: user?.nim_mahasiswa
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete semester data");
            }

            setShowConfirmDelete({ show: false, id: 0 });
            setShowToast({ show: true, status: 'success', message: "Semester deleted successfully!" });
        } catch (error) {
            console.error("Error deleting semester data:", error);
            setShowToast({ show: true, status: 'error', message: "Failed to delete semester." });
        }
    }
    // 

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Semester
                </h1>
            </div>

            {/* Semester List */}
            {semesters?.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-10 text-center">
                    <p className="text-gray-500">No semester data yet.</p>

                    <div
                        onClick={openAddModal}
                        className="mt-5 flex flex-col items-center justify-center cursor-pointer bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all p-8"
                    >
                        <Plus size={30} className="text-blue-500 mb-2" />

                        <p className="text-gray-600 font-medium">
                            Add New Semester
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semesters.map((semester) => (
                        <div
                            key={semester.id_semester}
                            className="group bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {semester.nama_semester}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {semester.academic_year}
                                    </p>

                                    <span className={`text-xs mt-2 inline-block px-2 py-1 rounded-full 
                                        ${semester.status_semester === "ACTIVE"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-gray-100 text-gray-500"
                                        }`}>
                                        {semester.status_semester}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(semester)}
                                        className="cursor-pointer p-2 rounded-lg hover:bg-blue-100 text-blue-500"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <button
                                        onClick={() => semester.id_semester && setShowConfirmDelete({ show: true, id: semester.id_semester })}
                                        className="cursor-pointer p-2 rounded-lg hover:bg-red-100 text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 h-1 w-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full opacity-70"></div>
                        </div>
                    ))}

                    {/* Add Semester Card */}
                    <div
                        onClick={openAddModal}
                        className="flex flex-col items-center justify-center cursor-pointer bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all p-8"
                    >
                        <Plus size={30} className="text-blue-500 mb-2" />

                        <p className="text-gray-600 font-medium">
                            Add New Semester
                        </p>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                {editId ? "Edit Semester" : "Add Semester"}
                            </h2>

                            <button onClick={() => setShowModal(false)} className="cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <div>
                            <label htmlFor="semesterName" className="block text-sm font-medium text-gray-700 mb-1">
                                Semester Name
                            </label>

                            <input
                                type="text"
                                placeholder="Semester name"
                                value={semesterName}
                                onChange={(e) => setSemesterName(e.target.value)}
                                className="w-full border px-4 py-2 rounded-lg mb-3"
                            />
                        </div>

                        <div>
                            <label htmlFor="semesterStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                Semester Status
                            </label>

                            <select
                                value={semesterStatus}
                                onChange={(e) => setSemesterStatus(e.target.value)}
                                className="w-full border px-4 py-2 rounded-lg mb-3"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                                Academic Year
                            </label>

                            <input
                                type="text"
                                placeholder="Academic Year (ex: 2025/2026)"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                className="w-full border px-4 py-2 rounded-lg"
                            />
                        </div>

                        <button
                            onClick={editId ? () => handleUpdate() : () => handleAdd()}
                            className="cursor-pointer mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            {editId ? "Update Semester" : "Add Semester"}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {showConfirmDelete.show && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">
                            Confirm Delete
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this semester? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowConfirmDelete({ show: false, id: 0 })}
                                className="cursor-pointer px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    handleDelete(showConfirmDelete.id);
                                }}
                                className="cursor-pointer px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Error or Success */}
            {showToast.show && (
                <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${showToast.status === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                    {showToast.message}
                </div>
            )}
        </div>
    );
};

export default Semester;