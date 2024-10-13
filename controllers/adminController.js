
const bcrypt = require("bcrypt");
const _db = require("../config/db");
const { ObjectId } = require("mongodb");

exports.redirectToLogin = (req, res) => {
    res.redirect("/admin/login");
};

exports.getLoginPage = (req, res) => {
    if (req.session.isAdmin) {
        res.redirect("/admin/dashboard");
    } else {
        res.render("admin/adminLogin.ejs");
    }
};

exports.loginAdmin = (req, res) => {
    let { email, password } = req.body;
    let mail = "admin@mywastewatch.com";
    let hashed_pass = "$2b$12$oL5g1RTfp9pwCwLxQhXuLOABofHVV20HzfhJrPIHjtaXkfjfKZsri"; // Admin@4040

    if (email === mail && bcrypt.compareSync(password, hashed_pass)) {
        req.session.isAdmin = true;
        res.redirect("/admin/dashboard");
    } else {
        res.send("Email or Password is wrong");
    }
};

exports.getAdminDashboard = async (req, res) => {
    let db = _db.getDb();
    /*if (!db) {
        console.error('Database instance is not available');
        return res.status(500).send('Internal Server Error');
    }*/

    try {
        let result = await db
            .collection("requests")
            .find({}, {
                projection: {
                    _id: false,
                    request_type: true,
                    status: true,
                    assignedDriver: true,
                },
            })
            .toArray();

        let driverData = await db
            .collection("drivers")
            .find({}, {
                projection: {
                    _id: false,
                    vehicleType: true,
                },
            })
            .toArray();

        let userData = await db
            .collection("users")
            .find({}, {
                projection: {
                    _id: false,
                    name: true,
                },
            })
            .toArray();

        const total_requests = result.length;
        const total_pending = result.filter((item) => item.status === "Pending").length;
        const total_resolved = result.filter((item) => item.status === "Resolved").length;
        const total_pickup_request = result.filter((item) => item.request_type === "Pickup").length;
        const total_complaint_request = result.filter((item) => item.request_type === "Complaint").length;
        const total_recycling_request = result.filter((item) => item.request_type === "Recycling").length;
        const total_other_request = result.filter((item) => item.request_type === "Other").length;
        const total_unassigned_driver_requests = result.filter((item) => item.assignedDriver === "none").length;
        const total_users = userData.length;
        const total_drivers = driverData.length;
        const total_trucks = driverData.filter((item) => item.vehicleType === "Truck").length;
        const total_cars = driverData.filter((item) => item.vehicleType === "Car").length;
        const total_van = driverData.filter((item) => item.vehicleType === "Van").length;
        const total_motorcycle = driverData.filter((item) => item.vehicleType === "Motorcycle").length;

        res.render("admin/adminDashboard.ejs", {
            result: {
                total_requests,
                total_pending,
                total_resolved,
                total_pickup_request,
                total_complaint_request,
                total_recycling_request,
                total_other_request,
                total_unassigned_driver_requests,
                total_drivers,
                total_users,
                total_trucks,
                total_cars,
                total_van,
                total_motorcycle,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching dashboard data.");
    }
};

exports.getAllRequests = async (req, res) => {
    let db = _db.getDb();

    try {
        let allDrivers = await db.collection("drivers").find({}).project({ name: 1 }).toArray();

        let result = await db.collection("requests").find({}).toArray();
        res.render("admin/allRequests.ejs", { requests: result.reverse(), drivers: allDrivers });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching requests.");
    }
};

exports.assignDriver = async (req, res) => {
    let { driverId, requestId } = req.query;
    let db = _db.getDb();

    try {
        let driverName = await db.collection("drivers")
            .find({ _id: new ObjectId(driverId) })
            .project({ _id: 0, name: 1 })
            .toArray();
        
        if (!driverName.length) {
            return res.status(404).json({ isOK: false, msg: "Driver not found." });
        }

        driverName = driverName[0].name;

        let data = await db.collection("requests").findOneAndUpdate(
            { _id: new ObjectId(requestId) },
            {
                $set: {
                    assignedDriver: driverName,
                    assignedDriverId: driverId,
                },
            },
            { returnDocument: "after" }
        );

        if (data.value) {
            res.json({
                isOK: true,
                msg: "The driver has been assigned",
                driverName: data.value.assignedDriver,
            });
        } else {
            res.status(500).json({ isOK: false, msg: "Failed to assign driver." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ isOK: false, msg: "An error occurred while assigning the driver." });
    }
};

exports.unassignDriver = async (req, res) => {
    let requestId = req.query.requestId;
    let db = _db.getDb();

    try {
        let result = await db.collection("requests").findOneAndUpdate(
            { _id: new ObjectId(requestId) },
            {
                $set: {
                    assignedDriver: "",
                    assignedDriverId: "",
                },
            },
            { returnDocument: "after" }
        );

        if (result.value && result.value.assignedDriver === "" && result.value.assignedDriverId === "") {
            res.json({
                isUnassigned: true,
                msg: "The driver has been unassigned successfully.",
            });
        } else {
            res.status(500).json({ isUnassigned: false, msg: "Failed to unassign driver." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ isUnassigned: false, msg: "An error occurred while unassigning the driver." });
    }
};

exports.rejectRequest = async (req, res) => {
    let requestId = req.query.requestId;
    let db = _db.getDb();

    try {
        let result = await db.collection("requests").findOneAndUpdate(
            { _id: new ObjectId(requestId) },
            {
                $set: {
                    status: "rejected",
                    assignedDriver: "",
                    assignedDriverId: "",
                },
            },
            { returnDocument: "after" }
        );

        if (result.value && result.value.status === "rejected") {
            res.json({
                isRejected: true,
                msg: "The request has been rejected successfully",
            });
        } else {
            res.status(500).json({ isRejected: false, msg: "Failed to reject request." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ isRejected: false, msg: "An error occurred while rejecting the request." });
    }
};


exports.getCreateDriverPage = (req, res) => {
    res.render("admin/createDriver.ejs");
};

exports.createDriver = async (req, res) => {
    let db = _db.getDb();
    let body = req.body;

    try {
        let isExistingUser = await db.collection("drivers").findOne({
            $or: [{ email: body.email }, { phone: body.phone }],
        });

        if (isExistingUser) {
            res.send("Email or phone already registered");
        } else {
            if (body.password !== body.confirmPassword) {
                res.send("Passwords don't match");
            } else {
                body.password = bcrypt.hashSync(body.password, 10);
                delete body.confirmPassword;
                await db.collection("drivers").insertOne(body);
                res.send("Driver Created");
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while creating the driver.");
    }
};

exports.getAllDrivers = async (req, res) => {
    try {
        let db = _db.getDb();
        const page = parseInt(req.query.page) || 1; // Get the current page, default to 1
        const limit = 20; // Set the number of items per page
        const skip = (page - 1) * limit; // Calculate the number of items to skip

        const totalDrivers = await db.collection("drivers").countDocuments(); // Count total drivers
        const totalPages = Math.ceil(totalDrivers / limit); // Calculate total pages

        let result = await db.collection("drivers")
            .find({})
            .project({ password: 0 })
            .skip(skip) // Skip the previous pages
            .limit(limit) // Limit to the number of drivers per page
            .toArray();

        const pagination = {
            totalPages: totalPages,
            currentPage: page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page - 1,
            nextPage: page + 1,
        };

        res.render("admin/allDrivers.ejs", {
            drivers: result,
            pagination: pagination // Passing the pagination object
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching drivers.");
    }
};

exports.deleteDriver = async (req, res) => {
    try {
        let driverId = req.params.id; 
        let db = _db.getDb();

        const driver = await db.collection("drivers").findOne({ _id: new ObjectId(driverId) });
        
        if (!driver) {
            return res.status(404).send("Driver not found"); 
        }

        const result = await db.collection("drivers").deleteOne({ _id: new ObjectId(driverId) });

        if (result.deletedCount === 1) {
            res.send("Driver deleted successfully"); 
        } else {
            res.status(500).send("An error occurred while deleting the driver."); 
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while deleting the driver."); 
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        let db = _db.getDb();
        const page = parseInt(req.query.page) || 1; 
        if (isNaN(page) || page < 1) {
            return res.status(400).send("Invalid page number.");
        }
        
        const limit = 25; 
        const skip = (page - 1) * limit; 

        const total_users = await db.collection("users").countDocuments(); 
        const totalPages = Math.ceil(total_users / limit); 

        let result = await db.collection("users")
            .find({})
            .project({ password: 0 }) // Exclude password from results
            .skip(skip) 
            .limit(limit) 
            .toArray();

        const pagination = {
            totalPages: totalPages,
            currentPage: page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
        };

        res.render("admin/allUsers.ejs", {
            users: result,
            pagination: pagination
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching users.");
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id; 
        const db = _db.getDb();

        // Check if user exists
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        
        if (!user) {
            return res.status(404).send("User not found"); 
        }

        // Attempt to delete the user
        const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

        // Check if deletion was successful
        if (result.deletedCount === 1) {
            return res.send("User deleted successfully"); 
        } else {
            return res.status(500).send("An error occurred while deleting the user."); 
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("An error occurred while deleting the user."); 
    }
};

/*
exports.getAdminDashboard = async(req, res) => {
    try {
        const dashboardItemCount = await Users.countDocuments();

        res.render('admin/adminDashboard.ejs', {dashboardItemCount });
    } catch (error){
        console.error(error);
        res.status(500).send('Server Error');
    }
};*/

exports.logoutAdmin = (req, res) => {
    req.session.isAdmin = false;
    res.redirect("/");
};
