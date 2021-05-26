'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config')

const app = express();
const router = express.Router();

//conectar ao BD
mongoose.connect(config.connectionString);

//Carregar os Models
const Product = require('./models/product')
const Customer = require('./models/customer')
const Order = require('./models/order')

//Carregar as rotas
const index = require('./routes/index-route');
const productRoute = require('./routes/product-route');
const customerRoute = require('./routes/customer-route');
const orderRoute = require('./routes/order-route');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.use('/',index);
app.use('/products', productRoute);
app.use('/customers', customerRoute);
app.use('/orders', orderRoute);


module.exports = app;