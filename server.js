/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Jhonatan Lopez Olguin 
Student ID: 147028237 
Date: 6 Febr 2025
Cyclic Web App URL: https://replit.com/@JhonatanLopez6/web322-app?v=1
GitHub Repository URL: https://github.com/jhonath1010/web322-app

********************************************************************************/ 

const storeService = require('./store-service.js');

// Importing express module
const express = require('express');
const path = require('path');

// Creating express application
const app = express();

// Setting the port number
const HTTP_PORT = process.env.PORT || 8080;


// Start using static middleware
app.use(express.static('public'));

// Redirect on '/'
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Get request
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/shop.html"));
    storeService.getPublishedItems()
        .then((data) => {
            res.send(data);
        })
        .catch((reason) => {
            console.log(reason);
        })
});

app.get('/items', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/items.html"));
    storeService.getAllItems()
        .then((data) => {
            res.send(data);
        })
        .catch((reason) => {
            console.log(reason);
        })
});

app.get('/categories', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/categories.html"));
    storeService.getCategories()
        .then((data) => {
            res.send(data);
        })
        .catch((reason) => {
            console.log(response);
        })
});

app.use((req, res) => {
    res.status(404).send('404: Page Not Found');
});

storeService.initialize()
    .then((data) => {
        console.log(data);
        app.listen(HTTP_PORT, ()=> {
            console.log(`Express http server listening on ${HTTP_PORT}`);
        });
    })
    .catch((reason) => {
        console.log(reason);
    });