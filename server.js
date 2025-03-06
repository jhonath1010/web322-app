/*********************************************************************************
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Jhonatan Lopez Olguin 
Student ID: 147028237 
Date: 5 March 2025
Cyclic Web App URL: https://replit.com/@JhonatanLopez6/web322-app?v=1
GitHub Repository URL: https://github.com/jhonath1010/web322-app
********************************************************************************/ 

const storeService = require('./store-service.js');
const express = require('express');
const path = require('path');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configuring Cloudinary
cloudinary.config({
    cloud_name: "dqcbey2fr",
    api_key: "465325822784863",
    api_secret: "GHqyVmEiERQYd13Ln1OVtTl_FVk",
    secure: true
});

const upload = multer();
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware for serving static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then((data) => {
            res.json(data); // Fix: Changed res.sendFile() to res.json() for data response
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

app.get('/items', (req, res) => {
    storeService.getAllItems()
        .then((data) => {
            res.json(data); // Fix: Changed res.sendFile() to res.json() for data response
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then((data) => {
            res.json(data); // Fix: Changed res.sendFile() to res.json() for data response
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

// Route to add new items
app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addItem.html"));
});
//Upload Image New AS3
app.post('/items/add', upload.single("featureImage"), function (req, res, next) {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){

        req.body.featureImage = imageUrl;
        req.body.published = req.body.published ? true : false;

        storeService.addItem(req.body)
            .then(() => res.redirect('/items')) 
            .catch(err => res.status(500).json({ message: err }));
    }
});


//Update Items route
app.get("/items", (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then((items) => res.json(items))
            .catch(() => res.status(404).json({ message: "No results returned" }));
    } 
    else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then((items) => res.json(items))
            .catch(() => res.status(404).json({ message: "No results returned" }));
    } 
    else {
        storeService.getAllItems()
            .then((items) => res.json(items))
            .catch(() => res.status(404).json({ message: "Error fetching items" }));
    }
});
// Return item by id
app.get("/item/:id", (req, res) => {
    storeService.getItemById(req.params.id)
        .then((item) => res.json(item))
        .catch((err) => res.status(404).json({ message: err })); 
});



// 404 Error Handling
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '/views/err404.html'));
});

// Initialize the service and start the server
storeService.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Express HTTP server listening on ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.error("Initialization failed:", err);
        process.exit(1);
    });
