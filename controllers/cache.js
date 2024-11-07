// cache.js

const cache = {};

// Function to get a value from the cache by key
const getFromCache = (key) => {
    return cache[key];
};

// Function to set a value in the cache with an optional expiration duration
const setToCache = (key, value, duration) => {
    cache[key] = value;

    // Set expiration for the cache entry if duration is provided
    if (duration) {
        setTimeout(() => {
            delete cache[key];
        }, duration);
    }
};

// Function to delete a specific key from the cache
const deleteFromCache = (key) => {
    delete cache[key];
};

module.exports = {
    getFromCache,
    setToCache,
    deleteFromCache, // Export the delete function
};
