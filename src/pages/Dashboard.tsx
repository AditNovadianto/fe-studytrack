import { useState } from "react";
import { LayoutDashboard, Layers, Library, StickyNote, Images } from "lucide-react";
import logo from "../images/logo.png";
import Navbar from "../components/Navbar";
import Home from "../components/Home";
import Semester from "../components/Semester";
import Matakuliah from "../components/Matakuliah";
import Catatan from "../components/Catatan";

interface Semester {
    id_semester: number | null;
    nama_semester: string;
}

const menu = [
    { name: "Home", icon: <LayoutDashboard size={22} /> },
    { name: "Semester", icon: <Layers size={22} /> },
    { name: "Matakuliah", icon: <Library size={22} /> },
    { name: "Catatan", icon: <StickyNote size={22} /> },
    { name: "Photos", icon: <Images size={22} /> },
];

const Dashboard = () => {
    const [section, setSection] = useState('Home')
    const [activeSemester, setActiveSemester] = useState<Semester>({ id_semester: null, nama_semester: "No active semester" });

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="group bg-white shadow-lg w-20 hover:w-56 transition-all duration-300 flex flex-col overflow-hidden">
                {/* Logo */}
                <img
                    className="w-[80%] group-hover:w-[50%] transition-all duration-300 mx-auto my-5"
                    src={logo}
                    alt="logo"
                />

                {/* Menu */}
                <div className="flex flex-col mt-5 gap-2">
                    {menu.map((item, index) => (
                        <button
                            onClick={() => setSection(item.name)}
                            key={index}
                            className={`${section === item.name ? "bg-blue-100" : ""} flex items-center gap-4 px-7 py-3 hover:bg-blue-50 cursor-pointer transition-all duration-300`}
                        >
                            <div className="text-gray-600 shrink-0">
                                {item.icon}
                            </div>

                            <span
                                className="
                                whitespace-nowrap
                                text-gray-700
                                font-medium
                                opacity-0
                                -translate-x-3
                                group-hover:opacity-100
                                group-hover:translate-x-0
                                transition-all
                                duration-300
                                delay-100
                                "
                            >
                                {item.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full h-screen flex flex-col overflow-hidden">
                <Navbar activeSemester={activeSemester} setActiveSemester={setActiveSemester} />

                <div className="flex-1 overflow-y-auto">
                    {section === "Home" && <Home activeSemester={activeSemester} />}
                    {section === "Semester" && <Semester setActiveSemester={setActiveSemester} />}
                    {section === "Matakuliah" && <Matakuliah />}
                    {section === "Catatan" && <Catatan />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;