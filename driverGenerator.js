const mongoose = require('mongoose');

// Connect to MongoDB with authentication
mongoose.connect('mongodb://admin:Admin@4040@localhost:27017/mwwmsdb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define Driver schema
const driverSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    license: String,
    vehicle: String,
    vehicleType: String,
    password: String,
});

// Create Driver model
const Driver = mongoose.model('Driver', driverSchema);

// Function to generate random data
const getRandomInt = (max) => Math.floor(Math.random() * max);
const generateRandomPhoneNumber = () => `+256${getRandomInt(700000000)}`; // Assuming Ugandan phone numbers
const vehicleTypes = ["Van", "Truck", "Motorcycle"];
const defaultPassword = "defaultPassword123"; // Replace with a secure default password

// Sample names
const sampleNames = [
    "John Habyarimaana",
    "John Doe",
    // Add other names...
];

// Function to create drivers
const createDrivers = async () => {
    const drivers = [];

    for (let i = 0; i < 50; i++) { // Generate 50 drivers
        const nameIndex = getRandomInt(sampleNames.length);
        const name = sampleNames[nameIndex];

        // Ensure unique email
        const email = `${name.split(" ").join(".").toLowerCase()}${i}@gmail.com`;
        
        const license = `K${getRandomInt(100)}-${String.fromCharCode(65 + getRandomInt(26))}${getRandomInt(1000)}`; // Generate a random license plate
        const vehicle = `U${getRandomInt(1000)} ${String.fromCharCode(65 + getRandomInt(26))}${String.fromCharCode(65 + getRandomInt(26))}${getRandomInt(100)}`; // Generate a random vehicle name
        const vehicleType = vehicleTypes[getRandomInt(vehicleTypes.length)];

        const newDriver = new Driver({
            name,
            email,
            phone: generateRandomPhoneNumber(),
            license,
            vehicle,
            vehicleType,
            password: defaultPassword, // Use default password
        });

        drivers.push(newDriver);
    }

    // Save all drivers to the database
    await Driver.insertMany(drivers);
    console.log('All 50 drivers created successfully.');
    mongoose.connection.close(); // Close the database connection
};

// Create drivers
createDrivers().catch(err => console.error(err));
