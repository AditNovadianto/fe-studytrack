import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";

interface User {
    nim_mahasiswa: string;
    nama_mahasiswa: string;
    email_mahasiswa: string;
}

interface MatakuliahType {
    id_matakuliah: number;
    id_semester: number;
    nama_matakuliah: string;
    dosen_matakuliah: string;
    jam_mulai: string;
    jam_selesai: string;
}

const Matakuliah = () => {
    const [matakuliah, setMatakuliah] = useState<MatakuliahType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [activeSemester, setActiveSemester] = useState<{ id_semester: number | null; nama_semester: string }>({ id_semester: null, nama_semester: "No active semester" });
    const [showToast, setShowToast] = useState({ show: false, status: '', message: '' });
    const [showConfirmDelete, setShowConfirmDelete] = useState({ show: false, id: 0 });

    const [form, setForm] = useState({
        nama_matakuliah: "",
        dosen_matakuliah: "",
        jam_mulai: "",
        jam_selesai: ""
    });

    const navigate = useNavigate();

    // CHECK TOKEN EXPIRATION
    useEffect(() => {
        const token = sessionStorage.getItem("token");

        if (isTokenExpired(String(token))) {
            sessionStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
        }
    }, []);
    // 

    // GET USER FROM LOCALSTORAGE
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

    // FETCH DATA ACTIVE SEMESTER
    useEffect(() => {
        const fetchDataActiveSemester = async () => {
            if (!user?.nim_mahasiswa) return;

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/getActiveSemester/${user.nim_mahasiswa}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                );

                const data = await response.json();

                if (data.semester) {
                    setActiveSemester(data.semester);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchDataActiveSemester();
    }, [user]);
    // 

    // FETCH DATA MATAKULIAH
    useEffect(() => {
        const fetchDataMatakuliah = async () => {
            if (!activeSemester?.id_semester) return;

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/getAllMatakuliahBySemester/${activeSemester.id_semester}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                );

                const data = await response.json();

                setMatakuliah(data.matakuliah);
            } catch (error) {
                console.error(error);
            }
        };

        fetchDataMatakuliah();
    }, [activeSemester, showModal, showConfirmDelete]);
    // 

    // OPEN ADD, EDIT MODAL
    const openAddModal = () => {
        setEditId(null);

        setForm({
            nama_matakuliah: "",
            dosen_matakuliah: "",
            jam_mulai: "",
            jam_selesai: ""
        });

        setShowModal(true);
    };

    const openEditModal = (mk: MatakuliahType) => {
        setEditId(mk.id_matakuliah);

        setForm({
            nama_matakuliah: mk.nama_matakuliah,
            dosen_matakuliah: mk.dosen_matakuliah,
            jam_mulai: mk.jam_mulai,
            jam_selesai: mk.jam_selesai
        });

        setShowModal(true);
    };
    // 

    // HANDLE UPDATE, ADD, DELETE
    const handleUpdate = async () => {
        if (!editId) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/updateMatakuliah/${editId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        nama_matakuliah: form.nama_matakuliah,
                        dosen_matakuliah: form.dosen_matakuliah,
                        jam_mulai: form.jam_mulai,
                        jam_selesai: form.jam_selesai
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update matakuliah data");
            }

            setShowModal(false);
            setEditId(null);

            setShowToast({ show: true, status: 'success', message: "Matakuliah updated successfully!" });
        } catch (error) {
            console.error("Error updating matakuliah data:", error);
            setShowToast({ show: true, status: 'error', message: "Failed to update matakuliah." });
        }
    }

    const handleAdd = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/createMatakuliah`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        nama_matakuliah: form.nama_matakuliah,
                        dosen_matakuliah: form.dosen_matakuliah,
                        jam_mulai: form.jam_mulai,
                        jam_selesai: form.jam_selesai,
                        id_semester: activeSemester.id_semester
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create matakuliah data");
            }

            setShowModal(false);

            setShowToast({ show: true, status: 'success', message: "Matakuliah added successfully!" });
        } catch (error) {
            console.error("Error creating matakuliah data:", error);
            setShowToast({ show: true, status: 'error', message: "Failed to add matakuliah." });
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/deleteMatakuliah/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete matakuliah data");
            }

            setShowConfirmDelete({ show: false, id: 0 });

            setShowToast({ show: true, status: 'success', message: "Matakuliah deleted successfully!" });
        } catch (error) {
            console.error("Error deleting matakuliah data:", error);
            setShowToast({ show: true, status: 'error', message: "Failed to delete matakuliah." });
        }
    }
    // 

    console.log(matakuliah)

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Matakuliah
                </h1>
            </div>
            {/* GRID */}

            {matakuliah?.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-10 text-center">
                    <p className="text-gray-500">
                        No Matakuliah yet in this semester. Please add your Matakuliah or set an active semester.
                    </p>

                    <div
                        onClick={openAddModal}
                        className="mt-5 flex flex-col items-center justify-center cursor-pointer bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all p-8"
                    >
                        <Plus size={30} className="text-blue-500 mb-2" />

                        <p className="text-gray-600 font-medium">
                            Add Matakuliah
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matakuliah.map((mk) => (
                        <div
                            key={mk.id_matakuliah}
                            className="group bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="flex justify-between">
                                <div className="flex gap-3">
                                    <BookOpen className="text-blue-500" />

                                    <div>
                                        <p className="font-semibold text-lg">
                                            {mk.nama_matakuliah}
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            Semester ID : {mk.id_semester}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(mk)}
                                        className="cursor-pointer p-2 hover:bg-blue-100 rounded"
                                    >
                                        <Pencil size={18} className="text-blue-500" />
                                    </button>

                                    <button
                                        onClick={() => setShowConfirmDelete({ show: true, id: mk.id_matakuliah })}
                                        className="cursor-pointer p-2 hover:bg-red-100 rounded"
                                    >
                                        <Trash2 size={18} className="text-red-500" />
                                    </button>
                                </div>
                            </div>

                            {/* DOSEN */}
                            <div className="mt-4 text-sm text-gray-600">
                                <p>👨‍🏫 {mk.dosen_matakuliah}</p>

                                <p className="mt-1">
                                    ⏰ {mk.jam_mulai.slice(0, 5)} - {mk.jam_selesai.slice(0, 5)}
                                </p>
                            </div>
                            <div className="mt-4 h-1 w-full bg-linear-to-r from-blue-400 to-indigo-500 rounded"></div>
                        </div>
                    ))}

                    {/* ADD CARD */}
                    <div
                        onClick={openAddModal}
                        className="flex flex-col items-center justify-center cursor-pointer bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all p-8"
                    >
                        <Plus size={30} className="text-blue-500 mb-2" />

                        <p className="text-gray-600 font-medium">
                            Add Matakuliah
                        </p>
                    </div>
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-semibold">
                                {editId ? "Edit Matakuliah" : "Add Matakuliah"}
                            </h2>

                            <button onClick={() => setShowModal(false)} className="cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Matakuliah
                        </label>

                        <input
                            placeholder="Nama Matakuliah"
                            value={form.nama_matakuliah}
                            onChange={(e) => setForm({ ...form, nama_matakuliah: e.target.value })}
                            className="w-full border px-3 py-2 rounded mb-3"
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Dosen
                        </label>

                        <input
                            placeholder="Nama Dosen"
                            value={form.dosen_matakuliah}
                            onChange={(e) => setForm({ ...form, dosen_matakuliah: e.target.value })}
                            className="w-full border px-3 py-2 rounded mb-3"
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Jam Mulai
                        </label>

                        <input
                            type="time"
                            value={form.jam_mulai}
                            onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
                            className="w-full border px-3 py-2 rounded mb-3"
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Jam Selesai
                        </label>

                        <input
                            type="time"
                            value={form.jam_selesai}
                            onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })}
                            className="w-full border px-3 py-2 rounded mb-3"
                        />

                        <button
                            onClick={editId ? handleUpdate : handleAdd}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                            {editId ? "Update Matakuliah" : "Add Matakuliah"}
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
                            Are you sure you want to delete this matakuliah? This action cannot be undone.
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

export default Matakuliah;