require("dotenv-safe").config();

const mongo_client = require("mongodb").MongoClient;
const url = process.env.DB_URL;  
let _db;

module.exports = {
    connectToServer: async function (callback) {
        try {
            const client = await mongo_client.connect(url)
            _db = client.db("mwwmsdb");
            console.log("Hey, you're connected to MongoDB! 😂😹🙌👊");

            if ((await _db.listCollections({ name: "users" }).toArray()).length === 0) {
                await _db.createCollection("users");
                console.log("Created 'users' collection.");
            } else {
                console.log("'users' collection already exists.");
            }

            callback(null);
        } catch (err) {
            console.error('Connection Error:', err);
            callback(err);
        }
    },
    getDb: function () {
        return _db;
    }
};