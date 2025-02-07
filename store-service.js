// Export the module
module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
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