const mongoose = require('mongoose');
const MassageSchema = new mongoose. Schema ({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim:true,
        maxlength: [50,'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    tel: {
        type: String
    },
    time: {
        type: String,
        required: [true, 'Please add an open-close time']
    },
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
// Reverse populate with virtuals
MassageSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'massage',
  justOne: false
});

module.exports=mongoose.model('Massage', MassageSchema);