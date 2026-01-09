const { Presensi } = require("../models");
const { Op } = require("sequelize");
const multer = require('multer');
const path = require('path');

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Format nama file: userId-timestamp.jpg
        // Fallback if req.user is undefined (should not happen with middleware)
        const userId = req.user ? req.user.id : 'unknown';
        cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });

exports.CheckIn = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { latitude, longitude } = req.body;

        // req.file contains the uploaded file info
        const buktiFoto = req.file ? req.file.path : null;

        console.log("Processing CheckIn for User:", userId);
        console.log("Location:", latitude, longitude);
        console.log("Photo Path:", buktiFoto);

        // Cek apakah sudah check-in hari ini
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const existingAttendance = await Presensi.findOne({
            where: {
                userId: userId,
                checkIn: {
                    [Op.between]: [startOfDay, endOfDay],
                },
            },
        });

        if (existingAttendance) {
            if (req.file) {
                // Optional: Delete uploaded file if checkin failed?
            }
            return res.status(400).json({ message: "Anda sudah check-in hari ini." });
        }

        const newRecord = await Presensi.create({
            userId: userId,
            checkIn: new Date(),
            latitude: latitude,
            longitude: longitude,
            buktiFoto: buktiFoto
        });

        res.status(201).json({
            message: "Check-in berhasil",
            data: newRecord,
        });
    } catch (error) {
        console.error("CheckIn Error:", error);
        res.status(500).json({
            message: "Terjadi kesalahan pada server",
            error: error.message,
            stack: error.stack
        });
    }
};

exports.CheckOut = async (req, res) => {
    try {
        const { id: userId } = req.user;

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const recordToUpdate = await Presensi.findOne({
            where: {
                userId: userId,
                checkIn: {
                    [Op.between]: [startOfDay, endOfDay],
                },
                checkOut: null,
            },
        });

        if (!recordToUpdate) {
            return res.status(404).json({ message: "Belum ada data check-in hari ini atau sudah check-out." });
        }

        recordToUpdate.checkOut = new Date();
        await recordToUpdate.save();

        res.status(200).json({
            message: "Check-out berhasil",
            data: recordToUpdate,
        });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
    }
};

exports.deletePresensi = async (req, res) => {
    try {
        const { id } = req.params;
        const recordToDelete = await Presensi.findByPk(id);

        if (!recordToDelete) {
            return res.status(404).json({ message: "Data presensi tidak ditemukan." });
        }

        await recordToDelete.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus data presensi", error: error.message });
    }
};

exports.updatePresensi = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut } = req.body;

        const recordToUpdate = await Presensi.findByPk(id);

        if (!recordToUpdate) {
            return res.status(404).json({ message: "Data presensi tidak ditemukan." });
        }

        if (checkIn) recordToUpdate.checkIn = checkIn;
        if (checkOut) recordToUpdate.checkOut = checkOut;

        await recordToUpdate.save();
        res.json({ message: "Data presensi berhasil diperbarui", data: recordToUpdate });
    } catch (error) {
        res.status(500).json({ message: "Gagal memperbarui data presensi", error: error.message });
    }
};
