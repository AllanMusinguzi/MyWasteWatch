
const bcrypt = require("bcrypt");
const _db = require("../config/db");
const { ObjectId } = require("mongodb");
const dbConnection = require('../config/db');

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

/*exports.loginAdmin = (req, res) => {
    let { email, password } = req.body;
    let mail = "admin@mywastewatch.com";
    let hashed_pass = "$2b$12$oL5g1RTfp9pwCwLxQhXuLOABofHVV20HzfhJrPIHjtaXkfjfKZsri"; // Admin@4040

    if (email === mail && bcrypt.compareSync(password, hashed_pass)) {
        req.session.isAdmin = true;
        res.redirect("/admin/dashboard");
    } else {
        res.send("Email or Password is wrong");
    }
};*/

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
      const db = dbConnection.getDb();
      const adminsCollection = db.collection('admins');

      // Find the admin by email
      const admin = await adminsCollection.findOne({ email });

      if (!admin) {
          console.log('Login failed: No admin found with email:', email);
          return res.status(401).send("Email or Password is incorrect.");
      }

      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (isPasswordValid) {
          console.log('Login successful for:', email);
          req.session.isAdmin = true;
          req.session.adminId = admin._id.toString(); // Store admin ID in session
          return res.redirect("/admin/dashboard");
      } else {
          console.log('Login failed: Incorrect password for:', email);
          return res.status(401).send("Email or Password is incorrect.");
      }
  } catch (err) {
      console.error('Login Error:', err);
      return res.status(500).send("An error occurred while processing your request.");
  }
};

exports.addAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
      const db = dbConnection.getDb();
      const adminsCollection = db.collection('admins');

      // Check if admin already exists
      const existingAdmin = await adminsCollection.findOne({ email });
      if (existingAdmin) {
          return res.status(400).send("An admin with this email already exists.");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert new admin
      const result = await adminsCollection.insertOne({
          email,
          password: hashedPassword,
          createdAt: new Date()
      });

      console.log('New admin added:', email);
      res.status(201).send("New admin added successfully.");
  } catch (err) {
      console.error('Error adding new admin:', err);
      res.status(500).send("An error occurred while adding new admin.");
  }
};

exports.listAdmins = async (req, res) => {
  try {
      const db = dbConnection.getDb();
      const adminsCollection = db.collection('admins');

      const admins = await adminsCollection.find({}, { projection: { password: 0 } }).toArray();
      res.json(admins);
  } catch (err) {
      console.error('Error listing admins:', err);
      res.status(500).send("An error occurred while listing admins.");
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
    const db = _db.getDb();
    try {
      const [allDrivers, result] = await Promise.all([
        db.collection("drivers").find({}).project({ name: 1 }).toArray(),
        db.collection("requests").find({}).toArray()
      ]);
      res.render("admin/allRequests.ejs", { requests: result.reverse(), drivers: allDrivers });
    } catch (error) {
      handleError(res, error, "An error occurred while fetching requests.");
    }
  };
  
  exports.assignDriver = async (req, res) => {
    const { driverId, requestId } = req.query;
    const db = _db.getDb();
    try {
      const driver = await db.collection("drivers").findOne(
        { _id: new ObjectId(driverId) },
        { projection: { name: 1 } }
      );
  
      if (!driver) {
        return res.status(404).json({ success: false, message: "Driver not found." });
      }
  
      const result = await db.collection("requests").findOneAndUpdate(
        { _id: new ObjectId(requestId) },
        {
          $set: {
            assignedDriver: driver.name,
            assignedDriverId: driverId,
          },
        },
        { returnDocument: "after" }
      );
  
      if (result.value) {
        res.json({
          success: true,
          message: "The driver has been assigned",
          driverName: result.value.assignedDriver,
        });
      } else {
        res.status(404).json({ success: false, message: "Request not found or failed to assign driver." });
      }
    } catch (error) {
      handleError(res, error, "An error occurred while assigning the driver.");
    }
  };
  
  exports.unassignDriver = async (req, res) => {
    const { requestId } = req.query;
    const db = _db.getDb();
    try {
      const result = await db.collection("requests").findOneAndUpdate(
        { _id: new ObjectId(requestId) },
        {
          $unset: {
            assignedDriver: "",
            assignedDriverId: "",
          },
        },
        { returnDocument: "after" }
      );
  
      if (result.value && !result.value.assignedDriver && !result.value.assignedDriverId) {
        res.json({
          success: true,
          message: "The driver has been unassigned successfully.",
        });
      } else {
        res.status(404).json({ success: false, message: "Request not found or failed to unassign driver." });
      }
    } catch (error) {
      handleError(res, error, "An error occurred while unassigning the driver.");
    }
  };
  
  exports.rejectRequest = async (req, res) => {
    const { requestId } = req.query;
    const db = _db.getDb();
    try {
      const result = await db.collection("requests").findOneAndUpdate(
        { _id: new ObjectId(requestId) },
        {
          $set: { status: "rejected" },
          $unset: { assignedDriver: "", assignedDriverId: "" },
        },
        { returnDocument: "after" }
      );
  
      if (result.value && result.value.status === "rejected") {
        res.json({
          success: true,
          message: "The request has been rejected successfully",
        });
      } else {
        res.status(404).json({ success: false, message: "Request not found or failed to reject request." });
      }
    } catch (error) {
      handleError(res, error, "An error occurred while rejecting the request.");
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

        // Define pagination object
        const pagination = {
            totalPages: totalPages,
            currentPage: page,  
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
        };

        // Pass the users and pagination object to the EJS template
        res.render("admin/allUsers.ejs", {
            users: result,
            pagination: pagination, // Pass pagination object directly
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
