const jwt = require("../utils/jwt");
const bcrypt = require("../utils/bcrypt");
const _db = require("../config/db");
require("dotenv").config

exports.getHomepage = (req, res) => {
  let token = req.cookies["accesstoken"];
  jwt.verify(token, process.env.jwt_secret, (err, user) => {
    if (err) {
      res.render("homepage.ejs");
    } else {
      res.redirect("/home");
    }
  });
};



exports.getSignupPage = (req, res) => {
  res.render("user/signup.ejs");
};



exports.getLoginPage = (req, res) => {
  res.render("user/login.ejs");
};



exports.signupUser = async (req, res) => {
  let entered_data = req.body;
  let db = _db.getDb();
  let { number, password, email } = entered_data;

  entered_data.password = bcrypt.hashPassword(password);
  entered_data.time_stamp = new Date().toGMTString();

  let number_in_db = await db.collection("users").findOne({ number });
  let mail_in_db = await db.collection("users").findOne({ email });

  if (number_in_db || mail_in_db) {
    res.send("Number or Email already exists.");
  } else {
    try {
      await db.collection("users").insertOne(entered_data);
      res.render("user/login.ejs", { message: "You are signed Up, Now Login Here." });
    } catch (err) {
      console.log(err);
    }
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const db = _db.getDb();

  try {
    const data_in_db = await db.collection("users").findOne({ email });

    if (!data_in_db) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isPasswordRight = await bcrypt.comparePassword(password, data_in_db.password);

    if (!isPasswordRight) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const access_token = jwt.sign(
      { email: data_in_db.email, id: data_in_db._id },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.cookie("accesstoken", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 18000000 // 5 hours in milliseconds
    });

    console.log("User logged in");
    return res.redirect("/home");
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserDashboard = async (req, res) => {
  let token = req.cookies["accesstoken"];
  
  if (!token) {
    // Handle case where token is not available (e.g., redirect to login)
    return res.redirect('/login');
  }

  let email = jwt.decode(token, process.env.jwt_secret).email;
  let db = _db.getDb();

  // Retrieve user data from the database
  const user = await db.collection("users").findOne(
    { email },
    { projection: { profile_image: true, username: true, email: true, name: true, number: true, address: true } }
  );

  // Retrieve requests data
  let result = await db.collection("requests").find(
    { email },
    {
      projection: {
        _id: false,
        request_type: true,
        status: true,
        assignedDriver: true,
      },
    }
  ).toArray();

  let total_requests = result.length;
  let total_pending = result.filter((item) => item.status === "pending").length;
  let total_resolved = result.filter((item) => item.status === "resolved").length;
  let total_pickup_request = result.filter((item) => item.request_type === "Pickup").length;
  let total_complaint_request = result.filter((item) => item.request_type === "Complaint").length;
  let total_recycling_request = result.filter((item) => item.request_type === "Recycling").length;
  let total_other_request = result.filter((item) => item.request_type === "Other").length;
  let total_unassigned_driver_requests = result.filter((item) => item.assignedDriver === "none").length;

  res.render("user/userDashboard.ejs", {
    result: {
      total_requests,
      total_pending,
      total_resolved,
      total_pickup_request,
      total_complaint_request,
      total_recycling_request,
      total_other_request,
      total_unassigned_driver_requests,
    },
    user: user || null, // Pass user data to the view, or null if not found
  });
};


exports.logoutUser = (req, res) => {
  res.clearCookie("accesstoken");
  res.redirect("/");
};



// Get the Raise Request Page
exports.getRaiseRequestPage = (req, res) => {
  let token = req.cookies["accesstoken"];
  let user;

  try {
    user = jwt.decode(token, process.env.jwt_secret);
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }

  res.render("user/request.ejs", { user });
};

// Submit a new request
exports.submitRequest = (req, res) => {
  let token = req.cookies["accesstoken"];
  let user;

  try {
    user = jwt.decode(token, process.env.jwt_secret);
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }

  let data_to_insert_in_db = req.body;
  data_to_insert_in_db.email = user.email;
  data_to_insert_in_db.status = "pending";
  data_to_insert_in_db.time = new Date().toLocaleString();
  data_to_insert_in_db.assignedDriver = "none";

  let db = _db.getDb();
  db.collection("requests")
    .insertOne(data_to_insert_in_db)
    .then(() => {
      res.send("Your request has been submitted to our database.");
    })
    .catch((err) => {
      res.send("There is some error here");
    });
};

// Get My Requests Page
exports.getMyRequests = async (req, res) => {
  let token = req.cookies["accesstoken"];
  let user;

  try {
    user = jwt.decode(token, process.env.jwt_secret);
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }

  let db = _db.getDb();

  try {
    let result = await db.collection("requests").find({ email: user.email }).toArray();
    res.render("user/my-requests.ejs", { requests: result.reverse(), user });
  } catch (err) {
    res.send("There is some error.");
  }
};