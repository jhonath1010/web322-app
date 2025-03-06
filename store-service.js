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
// Ensure `addItem()` updates `itemsArray`
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        try {
            // "published" is explicitly set to false if undefined
            itemData.published = itemData.published ? true : false;

            //Correctly assign ID based on `itemsArray.length + 1`
            itemData.id = itemsArray.length + 1;

            // Ensure item is added to the correct dataset
            itemsArray.push(itemData);

            // Successfully resolve the new item
            resolve(itemData);
        } catch (error) {
            reject("Error adding item: " + error);
        }
    });
}

// ✅ Fix: Ensure `getItemById(id)` looks in `itemsArray`
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = itemsArray.find(item => item.id === parseInt(id)); 
        if (item) {
            resolve(item);
        } else {
            reject('item not found');
        }
    });
}

//Ensure `getItemsByCategory(category)` filters `itemsArray`
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const categoryItems = itemsArray.filter(item => item.category == category);
        if (categoryItems.length) {
            resolve(categoryItems);
        } else {
            reject('no results returned');
        }
    });
}

//Ensure `getItemsByMinDate(minDateStr)` filters `itemsArray`
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        if (isNaN(minDate.getTime())) {
            return reject("Invalid date format");
        }
        const dateItems = itemsArray.filter(item => new Date(item.postDate) >= minDate);
        if (dateItems.length) {
            resolve(dateItems);
        } else {
            reject('no results returned');
        }
    });
}
