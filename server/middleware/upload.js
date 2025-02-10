const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/students/'); // Directory where photos are stored
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, req.params.id + ext); // Rename file to match student _id
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Initialize Multer
const upload = multer({ storage, fileFilter });
module.exports = upload;
