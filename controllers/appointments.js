const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');
// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Public
exports.getAppointments = async (req, res, next) => {
    let query;
    if(req.user.role !== 'admin') {
        query = Appointment.find({ user: req.user.id }).populate({
            path: 'hospital',
            select: 'name province tel'
        });
    } else {
        if(req.params.hospitalId) {
            console.log(req.params.hospitalId);
            query = Appointment.find({ hospital: req.params.hospitalId }).populate({
                path: 'hospital',
                select: 'name province tel'
            });
        } else {
            query = Appointment.find().populate({
                path: 'hospital',
                select: 'name province tel'
            });
        }
    }
    try {
        const appointments = await query;
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Cannot find appointments" });
    }
};

//@desc     Get single appointment
//@route    GET /api/v1/appointments/:id
//@access   Public
exports.getAppointment = async (req, res, next) => { // เพิ่ม => และ {
    try { // ต้องมีปีกกาเปิดสำหรับ try
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'hospital',
            select: 'name description tel' // select ต้องอยู่ภายใน object ของ populate
        });

        if (!appointment) {
            return res.status(404).json({
                success: false, 
                message: `No appointment with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
        
    } catch (error) { // ต้องมีปีกกาเปิดสำหรับ catch
        console.log(error);
        return res.status(500).json({
            success: false, 
            message: "Cannot find Appointment"
        });
    }
};

exports.addAppointment = async (req, res, next) => {
    try {
        // 1. นำ hospitalId จาก URL params มาใส่ใน body
        req.body.hospital = req.params.hospitalId;

        // 2. ตรวจสอบว่า Hospital ที่ระบุมามีอยู่จริงหรือไม่
        const hospital = await Hospital.findById(req.params.hospitalId);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: `No hospital with the id of ${req.params.hospitalId}`
            });
        }
        // 1. ผูก user ID เข้ากับข้อมูลนัดหมายที่จะสร้าง
req.body.user = req.user.id;

// 2. ค้นหานัดหมายที่มีอยู่แล้วของผู้ใช้นี้
const existedAppointments = await Appointment.find({ user: req.user.id });

// 3. ตรวจสอบเงื่อนไข: ถ้าไม่ใช่ admin จะสร้างนัดหมายได้ไม่เกิน 3 รายการ
if (existedAppointments.length >= 3 && req.user.role !== 'admin') {
    return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 appointments`
    });
}

        // 3. สร้าง Appointment
        const appointment = await Appointment.create(req.body);

        // 4. ส่ง Response กลับ
        res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot create Appointment"
        });
    }
};

//@desc    Update appointment
//@route   PUT /api/v1/appointments/:id
//@access  Private
exports.updateAppointment = async (req, res, next) => {
    try {
        // 1. ค้นหาข้อมูลเดิมก่อนว่ามีอยู่จริงไหม
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `No appointment with the id of ${req.params.id}`
            });
        }

        // Make sure user is the appointment owner or an admin
if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to access this appointment`
    });
}
        // 2. ทำการอัปเดตข้อมูล
        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,           // ให้คืนค่าข้อมูลตัวที่อัปเดตแล้วกลับมา
            runValidators: true  // ตรวจสอบความถูกต้องของข้อมูลตาม Schema
        });

        // 3. ส่ง Response กลับ
        res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Appointment"
        });
    }
};

//@desc     Delete appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment = async (req, res, next) => {
    try {
        // 1. ค้นหา Appointment ก่อน
        const appointment = await Appointment.findById(req.params.id);

        // 2. ถ้าไม่เจอ ให้รีเทิร์น 404 ทันที
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `No appointment with the id of ${req.params.id}`
            });
        }

        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this appointment`
    });
}
        // 3. ถ้าเจอ ให้ทำการลบ
        await appointment.deleteOne();

        // 4. ส่ง Response กลับเมื่อลบสำเร็จ
        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false, 
            message: "Cannot delete Appointment"
        });
    }
};