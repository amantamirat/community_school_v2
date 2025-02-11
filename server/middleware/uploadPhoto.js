const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.params.type === 'teacher' ? 'uploads/teachers/' : 'uploads/students/';
        cb(null, folder);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const uploadStudent = multer({ storage, fileFilter });

module.exports = uploadStudent;
