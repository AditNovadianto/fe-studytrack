import { useEffect, useRef, useState } from "react"
import { isTokenExpired } from "../utils/auth"
import { useNavigate } from "react-router-dom"

interface User {
    nim_mahasiswa: string
    nama_mahasiswa: string
    email_mahasiswa: string
}

interface Matakuliah {
    id_matakuliah: number
    nama_matakuliah: string
}

interface Pertemuan {
    id_pertemuan: number
    nama_pertemuan: string
}

interface PhotoType {
    _id: string
    caption: string
    url: string
    createdAt: string | number | Date
}

const Photos = () => {

    const [matakuliah, setMatakuliah] = useState<Matakuliah[]>([])
    const [selectedMatakuliah, setSelectedMatakuliah] = useState<Matakuliah | null>(null)

    const [pertemuan, setPertemuan] = useState<Pertemuan[]>([])
    const [selectedPertemuan, setSelectedPertemuan] = useState<Pertemuan | null>(null)

    const [photos, setPhotos] = useState<PhotoType[]>([])

    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const [user, setUser] = useState<User | null>(null)

    const [activeSemester, setActiveSemester] = useState<{ id_semester: number | null; nama_semester: string }>({
        id_semester: null,
        nama_semester: "No active semester"
    })

    const [showModal, setShowModal] = useState(false)

    const [file, setFile] = useState<File | Blob | null>(null)

    const [cameraOpen, setCameraOpen] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [showToast, setShowToast] = useState({ show: false, status: "", message: "" })
    const [showConfirmDelete, setShowConfirmDelete] = useState({ show: false, id: "" })

    const navigate = useNavigate()

    // CHECK TOKEN EXPIRATION
    useEffect(() => {
        const token = sessionStorage.getItem("token")

        if (isTokenExpired(String(token))) {
            sessionStorage.removeItem("token")
            localStorage.removeItem("user")
            navigate("/")
        }
    }, [])
    // 

    // GET USER FROM LOCALSTORAGE
    useEffect(() => {
        const storedUser = localStorage.getItem("user")

        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])
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

                if (data.semester) setActiveSemester(data.semester)
            } catch (error) {
                console.error("Fetch active semester error:", error)

                setShowToast({
                    show: true,
                    status: "error",
                    message: "Failed to fetch active semester"
                })

            }
        }

        fetchDataActiveSemester()
    }, [user])
    // 

    // FETCH LIST MATAKULIAH
    useEffect(() => {
        if (!activeSemester?.id_semester) return

        const fetchDataMatakuliah = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/getAllMatakuliahBySemester/${activeSemester.id_semester}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                )

                const data = await response.json()

                setMatakuliah(data.matakuliah)
            } catch (error) {
                console.error("Fetch matakuliah error:", error)

                setShowToast({
                    show: true,
                    status: "error",
                    message: "Failed to fetch matakuliah"
                })

            }
        }

        fetchDataMatakuliah()
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
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                )

                const data = await response.json()

                setPertemuan(data.pertemuan)
            } catch (error) {
                console.error("Fetch pertemuan error:", error)

                setShowToast({
                    show: true,
                    status: "error",
                    message: "Failed to fetch pertemuan"
                })

            }
        }

        fetchPertemuan()
    }, [selectedMatakuliah])
    // 

    // FETCH LIST PHOTOS
    useEffect(() => {
        if (!selectedPertemuan) return

        const fetchPhotos = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/getPhotosByMatakuliahAndPertemuan/${selectedMatakuliah?.id_matakuliah}/${selectedPertemuan.id_pertemuan}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                        }
                    }
                )

                const data = await response.json()

                setPhotos(data.data)
            } catch (error) {
                console.error("Fetch photos error:", error)

                setShowToast({
                    show: true,
                    status: "error",
                    message: "Failed to fetch photos"
                })
            }
        }

        fetchPhotos()
    }, [selectedPertemuan, showModal, showConfirmDelete.show])
    // 

    // HANDLE CREATE, EDIT, DELETE PHOTO
    const handleUploadPhoto = async () => {
        if (!file) return

        const formData = new FormData()

        formData.append("image", file)
        formData.append("id_matakuliah", String(selectedMatakuliah?.id_matakuliah))
        formData.append("id_pertemuan", String(selectedPertemuan?.id_pertemuan))

        try {
            await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/uploadPhoto`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    },
                    body: formData
                }
            )

            setShowModal(false)
            setFile(null)
            setPreview(null)

            setShowToast({
                show: true,
                status: "success",
                message: "Photo uploaded successfully!"
            })
        } catch (error) {
            console.error("Upload photo error:", error)

            setShowToast({
                show: true,
                status: "error",
                message: "Failed to upload photo"
            })
        }
    }

    const handleDeletePhoto = async (id: string) => {
        try {
            await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/deletePhoto/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                }
            )

            setShowConfirmDelete({ show: false, id: "" })

            setShowToast({
                show: true,
                status: "success",
                message: "Photo deleted successfully!"
            })
        } catch (error) {
            console.error("Delete photo error:", error)

            setShowToast({
                show: true,
                status: "error",
                message: "Failed to delete photo"
            })
        }
    }

    const openCamera = async () => {
        setCameraOpen(true)

        const stream = await navigator.mediaDevices.getUserMedia({ video: true })

        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }

    const takePhoto = () => {
        const canvas = canvasRef.current
        const video = videoRef.current

        if (!canvas || !video) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext("2d")

        if (!ctx) return

        ctx.drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
            if (blob) {
                setFile(blob)
                setPreview(URL.createObjectURL(blob))
            }

        }, "image/jpeg")

        setCameraOpen(false)
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-8">
                Photo Gallery
            </h1>

            {matakuliah?.length === 0 ? (
                <p className="text-gray-500 text-center">There's no available courses for the current semester. Please add some courses.</p>
            ) : (
                <>
                    {!selectedMatakuliah && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {matakuliah?.map((mk) => (
                                <div
                                    key={mk.id_matakuliah}
                                    onClick={() => setSelectedMatakuliah(mk)}
                                    className="p-4 bg-white border rounded-xl shadow hover:shadow-lg cursor-pointer transition"
                                >
                                    {mk.nama_matakuliah}
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedMatakuliah && !selectedPertemuan && (
                        <div>
                            <button
                                onClick={() => setSelectedMatakuliah(null)}
                                className="cursor-pointer text-blue-500 mb-6"
                            >
                                ← Kembali
                            </button>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {pertemuan?.map((p) => (

                                    <div
                                        key={p.id_pertemuan}
                                        onClick={() => setSelectedPertemuan(p)}
                                        className="p-4 bg-white border rounded-xl shadow hover:shadow-lg cursor-pointer text-center"
                                    >
                                        {p.nama_pertemuan}
                                    </div>

                                ))}
                            </div>
                        </div>
                    )}

                    {selectedMatakuliah && selectedPertemuan && (
                        <div>
                            <div className="flex justify-between mb-6">
                                <button
                                    onClick={() => setSelectedPertemuan(null)}
                                    className="text-blue-500"
                                >
                                    ← Kembali
                                </button>

                                <button
                                    onClick={() => setShowModal(true)}
                                    className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                                >
                                    + Upload Photo
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {photos?.length === 0 && (
                                    <p className="text-gray-500">Belum ada photo</p>
                                )}

                                {photos?.map((photo) => (
                                    <div
                                        key={photo._id}
                                        className="group bg-white border rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                                    >
                                        <img
                                            src={photo.url}
                                            onClick={() => {
                                                setPreviewImage(photo.url)
                                            }}
                                            className="w-full h-44 object-cover cursor-pointer group-hover:scale-105 transition duration-300"
                                        />

                                        <div className="p-3 flex justify-between items-center">
                                            <p className="text-xs text-gray-600 truncate">
                                                {photo.caption}
                                            </p>

                                            <button
                                                onClick={() => setShowConfirmDelete({ show: true, id: photo._id })}
                                                className="cursor-pointer text-red-500 text-xs hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {previewImage && (
                        <div
                            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                            onClick={() => setPreviewImage(null)}
                        >
                            <div
                                className="max-w-4xl w-full p-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={previewImage}
                                    className="w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 p-5 flex justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white overflow-y-auto overflow-hidden w-105 rounded-2xl shadow-xl p-4 space-y-4">
                        <h2 className="text-xl font-semibold">
                            Upload Photo
                        </h2>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files) {
                                    const selectedFile = e.target.files[0]
                                    setFile(selectedFile)
                                    setPreview(URL.createObjectURL(selectedFile))
                                }
                            }}

                            className="cursor-pointer w-full border rounded-lg p-2"
                        />

                        <button
                            onClick={openCamera}
                            className="cursor-pointer w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                            Open Camera
                        </button>

                        {preview && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-1">Preview</p>
                                <img
                                    src={preview}
                                    className="w-full max-h-60 object-contain rounded-lg border"
                                />
                            </div>
                        )}

                        {cameraOpen && (
                            <div className="space-y-2">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    className="w-full rounded-lg"
                                />

                                <button
                                    onClick={takePhoto}
                                    className="cursor-pointer w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                                >
                                    Take Photo
                                </button>

                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => { setShowModal(false); setPreview(null) }}
                                className="cursor-pointer px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUploadPhoto}
                                className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Upload
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
                                    handleDeletePhoto(String(showConfirmDelete.id));
                                }}
                                className="cursor-pointer px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {showToast.show && (
                <div
                    className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg text-white z-50 transition-all ${showToast.status === "error" ? "bg-red-500" : "bg-green-500"}`}
                >
                    {showToast.message}
                </div>
            )}
        </div>
    )
}

export default Photos