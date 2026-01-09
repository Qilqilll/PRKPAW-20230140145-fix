
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    let role = '';

    if (token) {
        try {
            const decoded = jwtDecode(token);
            role = decoded.role;
        } catch (e) {
            console.error("Failed to decode token", e);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!token) return null;

    return (
        <nav className="bg-blue-600 p-4 text-white shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/dashboard" className="text-xl font-bold">Presensi App</Link>
                <div className="space-x-4">
                    <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
                    <Link to="/attendance" className="hover:text-gray-200">Absen</Link>
                    {role === 'admin' && (
                        <Link to="/report" className="hover:text-gray-200 font-bold border-b-2 border-transparent hover:border-white">Laporan (Admin)</Link>
                    )}
                    <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
