const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb'); 

async function createInitialAdmin() {
    const url = 'mongodb://admin:Admin%404040@localhost:27017/mwwmsdb?authSource=admin'; 
    const dbName = 'mwwmsdb';

    try {
        const client = await MongoClient.connect(url);
        console.log('Connected to MongoDB');

        const db = client.db(dbName); 
        const adminsCollection = db.collection('admins'); 

        await adminsCollection.createIndex({ email: 2 });

        const allPermissions = ['ALL'];

        const email = "admin@mywastewatch.com";
        const password = "Admin@4040";
        const hashedPassword = await bcrypt.hash(password, 20); 

        const adminDocument = {
            email: email,                              // Admin email
            password: hashedPassword,                  // Hashed password
            role: "superAdmin",                        // Admin role
            name: "Allan Patrick",                    // Admin full name
            phoneNumber: "+256765032388",              // Admin phone number
            isActive: true,                            // Whether the admin account is active
            createdAt: new Date(),                     // Timestamp when the account was created
            updatedAt: new Date(),                     // Timestamp when the account was last updated
            lastLogin: null,                           // Last login time (null for now)
            loginAttempts: 0,                          // Number of failed login attempts
            lockedUntil: null,                         // Account locked until (null for now)
            twoFactorAuthEnabled: false,               // Two-factor authentication enabled (false for now)
            permissions: allPermissions,               // Permissions
            profilePicture: "/images/admins/Admin.jpg", // Path to admin profile picture (optional)
            resetPasswordToken: null,                  // Token for password reset (null for now)
            resetPasswordExpires: null                 // Expiration date for password reset token (null for now)
        };

    
        await adminsCollection.insertOne(adminDocument);

        console.log('Initial admin created successfully with all fields');
    } catch (err) {
        console.error('Error occurred while creating the initial admin:', err.message);
        if (err.name === 'MongoNetworkError') {
            console.error('Network issue: Unable to connect to MongoDB. Check your connection.');
        } else if (err.name === 'MongoParseError') {
            console.error('Parsing error: Check the connection string syntax.');
        } else if (err instanceof bcrypt.BcryptError) {
            console.error('Password hashing failed:', err.message);
        } else {
            console.error('An unexpected error occurred:', err);
        }
    } finally {
        process.exit(); 
    }
}

createInitialAdmin();
