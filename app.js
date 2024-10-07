require('dotenv').config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const _db = require("./config/db");
const indexRoutes = require("./routes/index");

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));
app.use(express.static(path.join(__dirname, "public/")));
app.use(cookieParser());

// Routes
app.use("/", indexRoutes);

app.get('/services', (req, res) => {
    res.render('services');
});

app.get('/about-us', (req, res) => {
    res.render('about-us')
});

app.get('/contact-us', (req, res) => {
    res.render('contact-us')
});

app.post("/send-email", (req, res) => {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `Message from ${name}`,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ error: error.toString() });
        }
        res.status(200).json({ message: 'Email sent successfully' });
    });
});

app.get("*", (req, res) => {
    res.render("404.ejs");
});

// Initialize the database connection and start the server
_db.connectToServer((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    } else {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    }
});
