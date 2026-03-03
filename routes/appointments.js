const express = require('express');
const {
    getAppointments,
    getAppointment, 
    addAppointment, 
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointments');

const router = express.Router({ mergeParams: true });

// นำเข้า Middleware สำหรับความปลอดภัย
const { protect, authorize } = require('../middleware/auth');

// จัดการ Route พื้นฐาน (GET all, POST new)
router.route('/')
    .get(protect, getAppointments)
    .post(protect, authorize('admin', 'user'), addAppointment);

// จัดการ Route เฉพาะ ID (GET one, PUT, DELETE)
router.route('/:id')
    .get(protect, getAppointment)
    .put(protect, authorize('admin', 'user'), updateAppointment)
    .delete(protect, authorize('admin', 'user'), deleteAppointment);

module.exports = router;