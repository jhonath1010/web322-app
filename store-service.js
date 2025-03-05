// Export the module
module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem, //New added AS3
    getItemsByCategory, 
    getItemsByMinDate, 
    getItemById
}

// importing modules
const fs = require('fs');
const path = require('path');

// declaring global variables array type
let itemsArray = [];
let categoriesArray = [];

// Functions exported
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, fileData) => {
            if (err) {
                reject("Failed to initialize items");
                return;
            }
            try {
                itemsArray = JSON.parse(fileData);
            }
            catch (parseError) {
                reject('initialize process rejected: ' + parseError);
                return;
            }
            fs.readFile('./data/categories.json', 'utf8', (err, fileData) => {
                if (err) {
                    reject("Failed to initialize categories");
                    return;
                };
                try {
                    categoriesArray = JSON.parse(fileData);
                }
                catch (parseError) {
                    reject('initialize process rejected: ' + parseError);
                    return;
                }
                resolve('initialized');
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (itemsArray.length > 0) {
            resolve(itemsArray);
        }
        else {
            reject('No results returned');
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        if (itemsArray.length > 0) {
            let publishedItems = itemsArray.filter((element) => element.published === true);
            resolve(publishedItems);
        }
        else {
            reject('No results returned');
        }
    })
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categoriesArray.length > 0) {
            resolve(categoriesArray);
        }
        else {
            reject('No results returned');
        }
    })
}
//New addItem function AS3
const items = []; // Temporary in-memory storage

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        try {
            // Ensure "published" is explicitly set to false if undefined
            itemData.published = itemData.published ? true : false;
            
            // Assign a unique ID based on array length
            itemData.id = items.length + 1;
            
            // Add new item to the array
            items.push(itemData);
            
            // Resolve the promise with the new item
            resolve(itemData);
        } catch (error) {
            reject("Error adding item: " + error);
        }
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(item => item.category == category);
        filteredItems.length > 0 ? resolve(filteredItems) : reject("No results returned");
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        filteredItems.length > 0 ? resolve(filteredItems) : reject("No results returned");
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        let item = items.find(item => item.id == id);
        item ? resolve(item) : reject("No result returned");
    });
}
