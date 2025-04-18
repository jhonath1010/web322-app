/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
* assignment has been copied manually or electronically from any other source (including web sites) or
* distributed to other students.
*
* Name: Jhonatan Lopez Olguin
* Student ID: 147028237
* Date: 5 March 2025
*
* Cyclic Web App URL: https://replit.com/@JhonatanLopez6/web322-app?v=1
* GitHub Repository URL: https://github.com/jhonath1010/web322-app
********************************************************************************/

// Required modules
const express = require('express');
const path = require('path');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const expressEjsLayouts = require('express-ejs-layouts');
const storeService = require('./store-service.js');

// App setup
const app = express();
const upload = multer(); // for handling image uploads

// Cloudinary configuration
cloudinary.config({
    cloud_name: "dqcbey2fr",
    api_key: "465325822784863",
    api_secret: "GHqyVmEiERQYd13Ln1OVtTl_FVk",
    secure: true
});
const HTTP_PORT = process.env.PORT || 8080;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressEjsLayouts);
app.set('layout', 'layouts/main');

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to track active route & selected category
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    res.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    res.locals.viewingCategory = req.query.category;
    next();
});

// Helper function for formatting dates
app.locals.formatDate = function (dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Routes

// Home redirects to /shop
app.get('/', (req, res) => {
    res.redirect('/shop');
});

// Static about page
app.get('/about', (req, res) => {
    res.render('about');
});

// Get published items for shop
app.get('/shop', async (req, res) => {
    try {
        let items = req.query.category 
            ? await storeService.getPublishedItemsByCategory(req.query.category)
            : await storeService.getPublishedItems();

        const categories = await storeService.getCategories();

        res.render("shop", { data: { items, categories } });
    } catch (err) {
        res.render("shop", { data: { message: "no results", categories: [] } });
    }
});

// View a specific shop item
app.get('/shop/:id', async (req, res) => {
    try {
        let item = await storeService.getItemById(req.params.id);
        let items = await storeService.getPublishedItems();
        let categories = await storeService.getCategories();

        res.render("shop", { data: { item, items, categories } });
    } catch (err) {
        res.render("shop", { data: { message: "no results", categories: [] } });
    }
});

// View all items (with filters)
app.get('/items', async (req, res) => {
    try {
        const { category, minDate } = req.query;
        let items;

        if (category) {
            items = await storeService.getItemsByCategory(category);
        } else if (minDate) {
            items = await storeService.getItemsByMinDate(minDate);
        } else {
            items = await storeService.getAllItems();
        }

        if (items && items.length > 0) {
            res.render("items", { items });
        } else {
            res.render("items", { message: "no results" });
        }
    } catch (err) {
        res.render("items", { message: "no results" });
    }
});

// JSON data for one item (used for debugging/API)
app.get('/item/:id', (req, res) => {
    storeService.getItemById(req.params.id)
        .then(item => res.json(item))
        .catch(err => res.status(500).json({ message: err }));
});

// Render all categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        if (categories && categories.length > 0) {
            res.render("categories", { categories });
        } else {
            res.render("categories", { message: "no results" });
        }
    } catch (err) {
        res.render("categories", { message: "no results" });
    }
});

// Add category form
app.get('/categories/add', (req, res) => {
    res.render('addCategory');
});

// Add category (POST)
app.post('/categories/add', (req, res) => {
    storeService.addCategory(req.body)
        .then(() => res.redirect('/categories'))
        .catch(() => res.status(500).send("Unable to Add Category"));
});

// Delete category by ID
app.get('/categories/delete/:id', (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => res.redirect('/categories'))
        .catch(() => res.status(500).send("Unable to Remove Category / Category not found"));
});

// Add item form
app.get('/items/add', (req, res) => {
    storeService.getCategories()
        .then((data) => res.render('addItem', { categories: data }))
        .catch(() => res.render('addItem', { categories: [] }));
});

// Add item (POST with image upload to Cloudinary)
app.post('/items/add', upload.single("featureImage"), (req, res) => {
    const processItem = (imageUrl) => {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => res.redirect('/items'))
            .catch(err => {
                console.error("Error adding item:", err);
                res.status(500).send("Item Creation Error");
            });
    };

    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) resolve(result); else reject(error);
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        (async () => {
            try {
                const uploaded = await streamUpload(req);
                processItem(uploaded.url);
            } catch (err) {
                console.error("Upload failed:", err);
                res.status(500).send("Upload Error");
            }
        })();
    } else {
        processItem("");
    }
});

// Delete item by ID
app.get('/items/delete/:id', (req, res) => {
    storeService.deleteItemById(req.params.id)
        .then(() => res.redirect('/items'))
        .catch(() => res.status(500).send("Unable to Remove Item / Item not found"));
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).render('404');
});

// Initialize the data service and start the server
storeService.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("Express http server listening on port", HTTP_PORT);
        });
    })
    .catch((err) => {
        console.error('Error initializing data:', err);
        process.exit(1);
    });
