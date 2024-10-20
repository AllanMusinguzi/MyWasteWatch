const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const authMiddleware = require("../middleware/authMiddleware");
const csrf = require("csurf");

// Initialize CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

// Public Routes
router.get("/", userController.getHomepage);
router.get("/signup", csrfProtection, userController.getSignupPage);  // CSRF protection for signup page
router.get("/login", csrfProtection, userController.getLoginPage);    // CSRF protection for login page

// CSRF-protected routes for signup and login actions
router.post("/signup_process", csrfProtection, userController.signupUser);  // Apply CSRF protection
router.post("/login_process", csrfProtection, userController.loginUser);    // Apply CSRF protection

// Authenticated Routes with CSRF protection
router.get("/home", authMiddleware, csrfProtection, userController.getUserDashboard);
router.get("/logout", authMiddleware, csrfProtection, userController.logoutUser);
router.get("/raise-a-request", authMiddleware, csrfProtection, userController.getRaiseRequestPage);
router.post("/submit_request", authMiddleware, csrfProtection, userController.submitRequest);
router.get("/my-requests", authMiddleware, csrfProtection, userController.getMyRequests);


module.exports = router;
