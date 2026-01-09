
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon issue in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function AttendancePage() {
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [image, setImage] = useState(null);
    const webcamRef = useRef(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
    }, [webcamRef]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    setError("Gagal mendapatkan lokasi: " + err.message);
                }
            );
        } else {
            setError("Geolocation tidak didukung browser ini.");
        }
    }, []);

    const handleCheckIn = async () => {
        if (!coords || !image) {
            setError("Lokasi dan Foto wajib ada!");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            // Convert base64 to blob
            const blob = await (await fetch(image)).blob();

            const formData = new FormData();
            formData.append('latitude', coords.lat);
            formData.append('longitude', coords.lng);
            formData.append('image', blob, 'selfie.jpg');

            const response = await axios.post('http://localhost:3001/api/presensi/check-in', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage(response.data.message);
            setError(null);
        } catch (err) {
            setMessage(null);
            console.error(err.response);
            setError(err.response ? err.response.data.message + (err.response.data.error ? `: ${err.response.data.error}` : '') : "Check-in gagal");
        }
    };

    const handleCheckOut = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:3001/api/presensi/check-out', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(response.data.message);
            setError(null);
        } catch (err) {
            setMessage(null);
            setError(err.response ? err.response.data.message : "Check-out gagal");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Halaman Presensi</h1>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}

            {/* Map Section */}
            {coords ? (
                <div className="mb-6 border rounded-lg overflow-hidden shadow-lg h-64 z-0 relative">
                    <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[coords.lat, coords.lng]}>
                            <Popup>Lokasi Anda Saat Ini</Popup>
                        </Marker>
                    </MapContainer>
                </div>
            ) : (
                <div className="bg-gray-200 p-4 rounded text-center mb-4">Sedang memuat lokasi...</div>
            )}

            {/* Camera Section */}
            <div className="my-4 border rounded-lg overflow-hidden bg-black shadow-lg">
                {image ? (
                    <img src={image} alt="Selfie" className="w-full" />
                ) : (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full"
                    />
                )}
            </div>

            <div className="mb-6">
                {!image ? (
                    <button onClick={capture} className="w-full bg-blue-500 text-white py-2 rounded shadow hover:bg-blue-600 font-bold">
                        Ambil Foto 📸
                    </button>
                ) : (
                    <button onClick={() => setImage(null)} className="w-full bg-gray-500 text-white py-2 rounded shadow hover:bg-gray-600 font-bold">
                        Foto Ulang 🔄
                    </button>
                )}
            </div>

            <div className="flex gap-4">
                <button onClick={handleCheckIn} className="flex-1 bg-green-600 text-white py-3 rounded shadow hover:bg-green-700 font-bold">
                    CHECK IN
                </button>
                <button onClick={handleCheckOut} className="flex-1 bg-orange-500 text-white py-3 rounded shadow hover:bg-orange-600 font-bold">
                    CHECK OUT
                </button>
            </div>
        </div>
    );
}

export default AttendancePage;
