const fs = require('fs').promises; // Use fs.promises for async/await syntax
const path = require('path');

const removePhoto = async (photoPath) => {
    try {
        if (photoPath.startsWith('/uploads')) {
            photoPath = path.join('server', photoPath);  // Add the server directory
        }
        const fullPath = path.join(__dirname, '../..', photoPath);
        //console.log('Attempting to delete file at:', fullPath);
        try {
            await fs.access(fullPath); // Check if the file exists
            await fs.unlink(fullPath); // Delete the file
            //console.log('File deleted successfully:', fullPath);
        } catch (accessError) {
            if (accessError.code === 'ENOENT') {
                //console.log('File does not exist, skipping deletion:', fullPath);
            } else {
                throw accessError; // Re-throw other errors
            }
        }
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
};
module.exports = {
    removePhoto
};