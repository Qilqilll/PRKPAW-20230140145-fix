
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ReportPage() {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);
    const [filterNama, setFilterNama] = useState('');
    const [filterTanggal, setFilterTanggal] = useState('');
    const navigate = useNavigate();

    const fetchReports = async () => {
        const token = localStorage.getItem('token');
        try {
            let url = 'http://localhost:3001/api/reports/daily?';
            if (filterNama) url += `nama=${filterNama}&`;
            if (filterTanggal) url += `tanggal=${filterTanggal}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data.data);
        } catch (err) {
            if (err.response && err.response.status === 403) {
                setError("Akses Ditolak: Halaman ini khusus untuk Admin.");
            } else {
                setError("Gagal memuat laporan.");
            }
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Laporan Presensi Harian</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {!error && (
                <>
                    <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 shadow rounded">
                        <input
                            type="text"
                            placeholder="Cari Nama..."
                            className="border p-2 rounded flex-1"
                            value={filterNama}
                            onChange={(e) => setFilterNama(e.target.value)}
                        />
                        <input
                            type="date"
                            className="border p-2 rounded flex-1"
                            value={filterTanggal}
                            onChange={(e) => setFilterTanggal(e.target.value)}
                        />
                        <button onClick={fetchReports} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Filter</button>
                    </div>

                    <div className="overflow-x-auto bg-white shadow rounded">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="p-4">Nama</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Check In</th>
                                    <th className="p-4">Check Out</th>
                                    <th className="p-4">Lokasi (Lat, Lng)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length > 0 ? (
                                    reports.map((record) => (
                                        <tr key={record.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4 font-semibold">{record.user?.nama}</td>
                                            <td className="p-4 text-gray-600">{record.user?.email}</td>
                                            <td className="p-4 text-green-600">{new Date(record.checkIn).toLocaleString()}</td>
                                            <td className="p-4 text-red-600">{record.checkOut ? new Date(record.checkOut).toLocaleString() : '-'}</td>
                                            <td className="p-4 text-xs font-mono">{record.latitude}, {record.longitude}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-gray-500">Tidak ada data.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default ReportPage;
