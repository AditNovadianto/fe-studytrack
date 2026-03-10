import { useEffect, useState } from "react"
import { isTokenExpired } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import NoteEditor from "./NoteEditor";

interface User {
    nim_mahasiswa: string;
    nama_mahasiswa: string;
    email_mahasiswa: string;
}

interface Matakuliah {
    id_matakuliah: number
    nama_matakuliah: string
}

interface Pertemuan {
    id_pertemuan: number
    nama_pertemuan: string
}

interface CatatanType {
    _id: string;
    title: string;
    content: string;
    createdAt: string | number | Date;
    updatedAt: string | number | Date;
    id_catatan: number
    isi_catatan: string
}

const Catatan = () => {
    const [matakuliah, setMatakuliah] = useState<Matakuliah[]>([])
    const [selectedMatakuliah, setSelectedMatakuliah] = useState<Matakuliah | null>(null)

    const [pertemuan, setPertemuan] = useState<Pertemuan[]>([])
    const [selectedPertemuan, setSelectedPertemuan] = useState<Pertemuan | null>(null)

    const [catatan, setCatatan] = useState<CatatanType[]>([])

    const [user, setUser] = useState<User | null>(null);
    const [activeSemester, setActiveSemester] = useState<{ id_semester: number | null; nama_semester: string }>({ id_semester: null, nama_semester: "No active semester" });

    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: "",
        content: ""
    })

    const [showToast, setShowToast] = useState({ show: false, status: '', message: '' });
    const [showConfirmDelete, setShowConfirmDelete] = useState({ show: false, id: "" });

    const navigate = useNavigate();

    // CHECK TOKEN EXPIRATION
    useEffect(() => {
        const token = sessionStorage.getItem("token");

        if (isTokenExpired(String(token))) {
            sessionStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
        }

        return;
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

                if (response.status === 401) {
                    sessionStorage.removeItem("token")
                    localStorage.removeItem("user")
                    navigate("/")
                    return
                }

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

    // FETCH LIST MATAKULIAH
    useEffect(() => {
        const fetchDataMatakuliah = async () => {
            if (!activeSemester?.id_semester) return;

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/getAllMatakuliahBySemester/${activeSemester.id_semester}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                );

                if (response.status === 401) {
                    sessionStorage.removeItem("token")
                    localStorage.removeItem("user")
                    navigate("/")
                    return
                }

                const data = await response.json();

                setMatakuliah(data.matakuliah);
            } catch (error) {
                console.error(error);
            }
        };

        fetchDataMatakuliah();
    }, [activeSemester])
    // 

    // FETCH LIST PERTEMUAN
    useEffect(() => {
        if (!selectedMatakuliah) return

        const fetchPertemuan = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/getAllPertemuanByMatakuliah/${selectedMatakuliah.id_matakuliah}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                )

                if (response.status === 401) {
                    sessionStorage.removeItem("token")
                    localStorage.removeItem("user")
                    navigate("/")
                    return
                }

                const data = await response.json()

                console.log("pertemuan: ", data)

                setPertemuan(data.pertemuan)
            } catch (error) {
                console.error(error)
            }
        }

        fetchPertemuan()
    }, [selectedMatakuliah])

    // FETCH CATATAN
    useEffect(() => {
        if (!selectedMatakuliah || !selectedPertemuan) return

        const fetchCatatan = async () => {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/getAllNotesByMatakuliahAndPertemuan/${selectedMatakuliah.id_matakuliah}/${selectedPertemuan.id_pertemuan}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                }
            )

            if (response.status === 401) {
                sessionStorage.removeItem("token")
                localStorage.removeItem("user")
                navigate("/")
                return
            }

            const data = await response.json()

            setCatatan(data)
        }

        fetchCatatan()
    }, [selectedPertemuan, showModal, showToast.show])
    // 

    // HANDLE CREATE, EDIT, DELETE CATATAN
    const handleCreateNote = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/createNote`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        ...formData,
                        id_matakuliah: selectedMatakuliah?.id_matakuliah,
                        id_pertemuan: selectedPertemuan?.id_pertemuan
                    })
                }
            )

            const newNote = await response.json()

            console.log("newNote", newNote)

            setShowModal(false)
            setFormData({ title: "", content: "" })

            setShowToast({ show: true, status: 'success', message: 'Catatan berhasil dibuat!' })
        } catch (error) {
            console.error(error)
            setShowToast({ show: true, status: 'error', message: 'Gagal membuat catatan. Pastikan semua field terisi.' })
        }
    }

    const handleEditNote = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/updateNote/${currentNoteId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    },
                    body: JSON.stringify(formData)
                }
            )

            const updatedNote = await response.json()

            console.log("updateNote", updatedNote)

            setShowModal(false)
            setIsEditing(false)

            setFormData({ title: "", content: "" })

            setShowToast({ show: true, status: 'success', message: 'Catatan berhasil diperbarui!' })
        } catch (error) {
            console.error(error)
            setShowToast({ show: true, status: 'error', message: 'Gagal memperbarui catatan. Pastikan semua field terisi.' })
        }
    }

    const handleDeleteNote = async (id: string) => {
        try {
            await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/deleteNote/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                }
            )

            setShowConfirmDelete({ show: false, id: "" })
            setShowToast({ show: true, status: 'success', message: 'Catatan berhasil dihapus!' })
        } catch (error) {
            console.error(error)
            setShowToast({ show: true, status: 'error', message: 'Gagal menghapus catatan.' })
        }
    }
    // 

    console.log("Selected Matakuliah", selectedMatakuliah)
    console.log("Selected Pertemuan", selectedPertemuan)
    console.log("Catatan", catatan)

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Catatan
                </h1>
            </div>

            {matakuliah?.length === 0 ? (
                <p className="text-gray-500 text-center">There's no available courses for the current semester. Please add some courses.</p>
            ) : (
                <>
                    {/* LIST MATAKULIAH */}
                    {!selectedMatakuliah && (
                        <div>
                            <h1 className="text-xl font-semibold mb-4">Pilih Matakuliah</h1>

                            <div className="grid grid-cols-3 gap-4">
                                {matakuliah?.map((mk) => (
                                    <div
                                        key={mk.id_matakuliah}
                                        onClick={() => setSelectedMatakuliah(mk)}
                                        className="p-4 bg-white border rounded-lg shadow hover:shadow-md cursor-pointer"
                                    >
                                        {mk.nama_matakuliah}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LIST PERTEMUAN */}
                    {selectedMatakuliah && !selectedPertemuan && (
                        <div>
                            <button
                                onClick={() => setSelectedMatakuliah(null)}
                                className="cursor-pointer mb-4 text-blue-500"
                            >
                                ← Kembali
                            </button>

                            <h1 className="text-xl font-semibold mb-4">
                                {selectedMatakuliah.nama_matakuliah}
                            </h1>

                            <div className="grid grid-cols-4 gap-4">
                                {pertemuan?.map((p) => (
                                    <div
                                        key={p.id_pertemuan}
                                        onClick={() => setSelectedPertemuan(p)}
                                        className="p-4 bg-white border rounded-lg shadow hover:shadow-md cursor-pointer text-center"
                                    >
                                        {p.nama_pertemuan}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LIST CATATAN */}
                    {selectedMatakuliah && selectedPertemuan && (
                        <div>
                            <div className="sticky top-5 bg-black/20 backdrop-blur-md p-2 rounded-lg flex items-center gap-5 justify-between w-full">
                                <button
                                    onClick={() => setSelectedPertemuan(null)}
                                    className="cursor-pointer text-blue-500 hover:underline"
                                >
                                    ← Kembali
                                </button>

                                <button
                                    onClick={() => {
                                        setShowModal(true)
                                        setIsEditing(false)
                                    }}
                                    className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    + Tambah Catatan
                                </button>
                            </div>

                            <h1 className="text-xl font-semibold mb-6 mt-4">
                                {selectedPertemuan.nama_pertemuan}
                            </h1>

                            <div className="space-y-4">
                                {catatan?.length === 0 && (
                                    <p className="text-gray-500">Belum ada catatan</p>
                                )}

                                {catatan?.map((c) => (
                                    <div
                                        key={c._id}
                                        className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-lg font-semibold text-gray-800">
                                                {c.title}
                                            </h2>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(true)
                                                        setShowModal(true)
                                                        setCurrentNoteId(c._id)

                                                        setFormData({
                                                            title: c.title,
                                                            content: c.content
                                                        })
                                                    }}
                                                    className="cursor-pointer text-yellow-500 hover:text-yellow-600"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => setShowConfirmDelete({ show: true, id: c._id })}
                                                    className="cursor-pointer text-red-500 hover:text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            className="prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: c.content }}
                                        />

                                        <div className="flex items-center w-full justify-between">
                                            <div className="text-xs text-gray-400">
                                                Created {new Date(c.createdAt).toLocaleDateString("id-ID")}
                                            </div>

                                            <div className="text-xs text-gray-400">
                                                Updated {new Date(c.updatedAt).toLocaleDateString("id-ID")}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-white p-6 rounded-xl w-[50%] space-y-4">
                        <h2 className="text-lg font-semibold">
                            {isEditing ? "Edit Catatan" : "Tambah Catatan"}
                        </h2>

                        <input
                            type="text"
                            placeholder="Judul"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className="w-full border rounded-lg p-2"
                        />

                        <NoteEditor
                            content={formData.content}
                            onChange={(value) =>
                                setFormData({ ...formData, content: value })
                            }
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowModal(false); setIsEditing(false); setFormData({ title: "", content: "" }) }}
                                className="cursor-pointer px-3 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={isEditing ? handleEditNote : handleCreateNote}
                                className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg"
                            >
                                Save
                            </button>
                        </div>
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
                            Are you sure you want to delete this catatan? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowConfirmDelete({ show: false, id: "" })}
                                className="cursor-pointer px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    handleDeleteNote(String(showConfirmDelete.id));
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
    )
}

export default Catatan