
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
        let driverName = await db.collection("drivers").find({ _id: new ObjectId(driverId) }).project({ _id: 0, name: 1 }).toArray();
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
            res.json({
                isOK: false,
                msg: "Something went wrong.",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while assigning the driver.");
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

        if (result.value.assignedDriver === "" && result.value.assignedDriverId === "") {
            res.json({
                isUnassigned: true,
                msg: "The driver has been unassigned successfully.",
            });
        } else {
            res.json({
                isUnassigned: false,
                msg: "Something went wrong.",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while unassigning the driver.");
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

        if (result.value.status === "rejected") {
            res.json({
                isRejected: true,
                msg: "The request has been rejected successfully",
            });
        } else {
            res.json({
                isRejected: false,
                msg: "Something went wrong.",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while rejecting the request.");
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
        let result = await db.collection("drivers").find({}).project({ password: 0 }).toArray();
        res.render("admin/allDrivers.ejs", { drivers: result });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching drivers.");
    }
};

exports.deleteDriver = async (req, res) => {
    try {
        let driverId = req.query.driverId;
        let db = _db.getDb();
        await db.collection("drivers").deleteOne({ _id: new ObjectId(driverId) });
        res.send("Driver deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while deleting the driver.");
    }
};

exports.logoutAdmin = (req, res) => {
    req.session.isAdmin = false;
    res.redirect("/");
};
