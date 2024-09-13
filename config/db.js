require("dotenv").config();

const mongo_client = require("mongodb").MongoClient;
const url = process.env.db_url;  // Make sure this matches the .env file
let _db;

module.exports = {
    connectToServer: async function (callback) {
        try {
            const client = await mongo_client.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
            _db = client.db("waste_management_system");
            console.log("Hey, you're connected to MongoDB! 😂😹🙌👊");

            // Create a user table if it does not exist
            if ((await _db.listCollections({ name: "users" }).toArray()).length === 0) {
                await _db.createCollection("users");
            }

            callback(null);
        } catch (err) {
            console.error(err);
            callback(err);
        }
    },
    getDb: function () {
        return _db;
    }
};



/*
require("dotenv").config();

let mongo_client = require("mongodb").MongoClient;
let _db;

const db_url = process.env.db_url || "mongodb://admin:Admin@4040@mongodb:27017/waste_management_system?authSource=admin";

module.exports = {
    connectToServer: async function (callback) {
        try {
            let client = await mongo_client.connect(db_url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            _db = client.db("waste_management_system");
            console.log("Hello, Patrick! You're connected to MongoDB! 😂😹🙌👊✌️");

            // Create a 'users' collection if it doesn't exist
            const collections = await _db.listCollections({ name: "users" }).toArray();
            if (collections.length === 0) {
                await _db.createCollection("users");
                console.log("'users' collection created!");
            }

        } catch (err) {
            console.log("MongoDB connection error:", err);
        }
    },
    getDb: function () {
        return _db;
    }
};

*/