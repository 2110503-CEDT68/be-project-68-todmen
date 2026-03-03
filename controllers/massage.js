const Appointment = require('../models/Appointment');
const Massage = require('../models/Massage');

exports.getMassages= async (req, res, next)=>{
    let query;
    const reqQuery={...req.query};
    const removeFields=['select','sort','page','imit'];
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log (reqQuery);

    let queryStr=JSON.stringify(req.query);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

    

    query=Massage.find(JSON.parse(queryStr)).populate('appointments');

    if (req.query.select) {
        const fields=req.query.select.split(',').join(' ');
        query=query. select (fields);
    }
    if (req.query.sort) {
        const sortBy=req.query.sort.split(',').join(' ');
        query=query. sort (sortBy) ;
    }else {
        query=query.sort('-createdAt');
    }
    const page=parseInt (req.query.page, 10) || 1;
    const limit=parseInt (req.query.limit, 10) ||25;
    const startIndex= (page-1) *limit;
    const endIndex=page*limit;
    
    try{
        const total=await Massage.countDocuments ();
        query=query.skip(startIndex).limit(limit);

        const massages = await query;
        // console.log(req.query);
        const pagination ={};
        if (endIndex<total) {
            pagination.next={
                page: page+1,
                limit
            }
        }
        if (startIndex>0) {
            pagination.prev={
                page: page-1,
                limit
            }
        }
        res.status(200).json ({success: true, count: massages.length,pagination, data:massages});
    }catch(err){
        res.status(400).json ({success:false});
    }
};

exports.getMassage= async (req, res, next)=>{
    try{
        const massage = await Massage.findById (req.params.id);
        if (!massage) {
        return res. status(400).json ({success: false});
        }
        res. status(200).json ({success: true, data: massage});
    }catch(err){
        res. status(400).json ({success: false});
    }
// res.status(200).json({success: true, msg: `Get Massages ${req.params.id}`});
};

exports.createMassage= async (req, res, next)=>{
    const massage = await Massage.create(req.body);
    res.status(201).json ({success: true, data:massage});
    // res.status(200).json({success: true, msg: 'Create a Massages'});
};

exports.updateMassage= async (req, res, next)=>{
    try{
        const massage = await Massage.findByIdAndUpdate (req.params.id, req.body, {
        new: true,
        runValidators:true
    });
    if (!massage) {
        return res. status (400) . json ({success: false}) ;
    }
    res. status (200).json ({success: true, data: massage});
    }catch(err){
        res. status (400). json ({success: false});
    }
};

exports.deleteMassage = async (req, res, next) => {
    try {
        const massage = await Massage.findById(req.params.id);
        
        if (!massage) {
            return res.status(404).json({success: false, message: `Massage not found with id of ${req.params.id}`});
        }
        await Appointment.deleteMany({massage: req.params.id});
        await Massage.deleteOne({_id: req.params.id});
        res.status(200).json({success: true, data: {}});
    } catch (error) {
        console.log(error);
        res.status(400).json({success: false});
    }
};