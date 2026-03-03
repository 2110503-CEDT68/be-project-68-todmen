const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const {xss}=require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp');
const cors=require('cors');
const express = require ('express');
const dotenv = require ('dotenv');
const cookieParser=require ('cookie-parser');
const connectDB = require('./config/db');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

dotenv.config ({path: './config/config.env'});
connectDB () ;

const app=express () ;
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);
app.use(hpp());
app.use(cors());

app. use (cookieParser ()) ;

app.set('query parser','extended');

const massage = require('./routes/Massage')
const appointments =require ('./routes/appointments');
const auth = require('./routes/auth');
app.use('/api/v1/massage',massage)
app.use('/api/v1/appointments', appointments);
app.use('/api/v1/auth', auth);

const PORT=process.env.PORT || 5003;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, " mode on port ", PORT)) ;

process.on('unhandledRejection',(err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'A simple Express VacQ API'
    }
    ,
    servers:[
        {
            url: 'http://localhost:5003/api/v1'
        }
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));