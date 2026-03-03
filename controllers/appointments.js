const Appointment = require('../models/Appointment');
const Massage = require('../models/Massage');
exports.getAppointments = async (req, res, next) => {
  let query;

  let filter = {};
  if (req.user.role !== 'admin') {
    filter.user = req.user.id;
  }

  if (req.params.massageId) {
    filter.massage = req.params.massageId;
  }

  try {
    query = Appointment.find(filter).populate({
      path: 'massage',
      select: 'name province tel'
    });

    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot find Appointment"
    });
  }
};

exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: 'massage',
      select: 'name description tel'
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot find Appointment"
    });
  }
};

exports.addAppointment = async (req, res, next) => {
  try {
    // associate the requested massage shop id with the appointment
    req.body.massage = req.params.massageId;

    const massage = await Massage.findById(req.params.massageId);

    if (!massage) {
      return res.status(404).json({
        success: false,
        message: `No Massage with the id of ${req.params.massageId}`
      });
    }
    req.body.user = req.user.id;

    const existedAppointments = await Appointment.find({ user: req.user.id });

    if (existedAppointments.length >= 3 && req.user.role !== 'admin') {
    return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 appointments`
    });
    }
    const appointment = await Appointment.create(req.body);

    res.status(201).json({
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

exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`
      });
    }
    if (appointment.user.toString() !== req.user.id &&req.user.role !== 'admin') {
    return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment`
    });
    }
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

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

exports.deleteAppointment = async (req, res, next) => {
  try {
    // fetch appointment first so we can check authorization
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`
      });
    }

    if (
    appointment.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
    ) {
    return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this appointment`
    });
    }

    await appointment.deleteOne();

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