const { Presensi, User } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
    try {
        const { nama, tanggal } = req.query;
        let options = {
            where: {},
            include: [{
                model: User,
                as: 'user',
                attributes: ['nama', 'email'] // Ambil nama dan email dari tabel User
            }]
        };

        if (nama) {
            options.include[0].where = {
                nama: {
                    [Op.like]: `%${nama}%`,
                }
            };
        }

        if (tanggal) {
            const startOfDay = new Date(tanggal);
            const endOfDay = new Date(tanggal);
            endOfDay.setHours(23, 59, 59, 999);

            options.where.checkIn = {
                [Op.between]: [startOfDay, endOfDay],
            };
        }

        const records = await Presensi.findAll(options);

        // Format output agar sesuai dengan yang diharapkan frontend (flattening object jika perlu)
        // Tapi sebaiknya frontend yang menyesuaikan. Untuk kemudahan, kita kirim apa adanya dulu.

        res.json({
            reportDate: new Date().toLocaleDateString(),
            data: records,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Gagal mengambil laporan", error: error.message });
    }
};
