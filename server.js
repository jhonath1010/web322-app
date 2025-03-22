/*********************************************************************************
WEB322 – Assignment 04
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
//EJS added new
const exphbs = require('express-handlebars');

const upload = multer();
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Configuring Cloudinary
cloudinary.config({
    cloud_name: "dqcbey2fr",
    api_key: "465325822784863",
    api_secret: "GHqyVmEiERQYd13Ln1OVtTl_FVk",
    secure: true
});


// Middleware for serving static files
app.use(express.static('public'));

// Set Handlebars as the view engine
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return (
                '<li class="nav-item"><a ' +
                (url == app.locals.activeRoute ? ' class="nav-link active" ' : ' class="nav-link" ') + ' href="' +
                url +
                '">' +
                options.fn(this) +
                "</a></li>"
            );
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return context;
        }
    }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));


// Middleware for active route
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


// Routes
app.get('/', (req, res) => {
    res.redirect('/shop');
});

// Route to serve the "about.hbs" file 
app.get('/about', (req, res) => {
    res.render('about');
});


// Route to get all published items
app.get('/shop', async (req, res) => {
    let viewData = {};

    try {
        let items = [];
        if (req.query.category) {
            items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await storeService.getPublishedItems();
        }
        items.sort((a, b) => {
            const dateA = new Date(a.postDate);
            const dateB = new Date(b.postDate);
            if (dateA.getTime() === dateB.getTime()) {
                return b.id - a.id;
            }
            return dateB - dateA;
        });
        let item = items[0];
        viewData.items = items;
        viewData.item = item;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await storeService.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
});

// Route to get a specific published item by ID
app.get('/shop/:id', async (req, res) => {
    let viewData = {};

    try {
        let items = [];
        if (req.query.category) {
            items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await storeService.getPublishedItems();
        }
        items.sort((a, b) => {
            const dateA = new Date(a.postDate);
            const dateB = new Date(b.postDate);
            if (dateA.getTime() === dateB.getTime()) {
                return b.id - a.id;
            }
            return dateB - dateA;
        });
        viewData.items = items;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        viewData.item = await storeService.getItemById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await storeService.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
});


// Route to get all items 
app.get('/items', (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then(data => res.render('items', { items: data }))
            .catch(err => {
                console.error("Error in /items route with category filter:", err);
                res.status(500).render('items', { message: "no results" });
            });
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then(data => res.render('items', { items: data }))
            .catch(err => {
                console.error("Error in /items route with minDate filter:", err);
                res.status(500).render('items', { message: "no results" });
            });
    } else {
        storeService.getAllItems()
            .then(data => res.render('items', { items: data }))
            .catch(err => {
                console.error("Error in /items route:", err);
                res.status(500).render('items', { message: "no results" });
            });
    }
});
// Route to get all categories updated it
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(data => res.render('categories', { categories: data }))
        .catch(err => {
            console.error("Error in /categories route:", err);
            res.status(500).render('categories', { message: "no results" });
        });
});

// Route to add new items
app.get("/items/add", (req, res) => {
    res.render('addItem');
});


// Route to serve the "about.hbs" file 
app.get('/about', (req, res) => {
    res.render('about');
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
    res.status(404).render('404'); // Use EJS template instead of sending an HTML file
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