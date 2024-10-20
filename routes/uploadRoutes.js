const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({ dest: './public/images/Uploads/' });

router.post('/upload-profile-image', upload.single('image'), async (req, res) => {
    try {
        const { email } = req.session.user;

        if (req.session.user.role === 'admin') {
            await Admin.findOneAndUpdate({ email: email }, { profile_image: req.file.path });
        } else if (req.session.user.role === 'driver') {
            await Driver.findOneAndUpdate({ email: email }, { profile_image: req.file.path });
        } else if (req.session.user.role === 'user') {
            await User.findOneAndUpdate({ email: email }, { profile_image: req.file.path });
        }

        res.status(200).send('Profile image updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while uploading the image');
    }
});

module.exports = router;
