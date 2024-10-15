const mongoose = require('mongoose');

const uri = 'mongodb://admin:Admin@4040/mwwmsdb'; 

const requestSchema = new mongoose.Schema({
    title: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.model('Request', requestSchema);

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000, 
})
.then(() => {
    console.log("MongoDB connected successfully!");// Connect to MongoDB
    addRequests(); 
})
.catch(err => {
    console.error("MongoDB connection error:", err);
});

// Function to add requests to the database
async function addRequests() {
    const requests = [
        { title: "Request 1", description: "Description for request 1" },
        { title: "Request 2", description: "Description for request 2" },
        { title: "Request 3", description: "Description for request 3" }
    ];

    try {
        const insertedDocs = await Request.insertMany(requests);
        console.log("Requests added successfully:", insertedDocs);
    } catch (error) {
        console.error("Error creating requests:", error);
    } finally {
        mongoose.connection.close(); 
    }
}
