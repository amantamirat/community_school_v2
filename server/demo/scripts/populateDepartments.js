const mongoose = require('mongoose');
const faker = require('faker');
const Department = require('../../models/department'); 
require('dotenv').config();

async function connectDB() {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
}

const populateDepartments = async (count = 10) => {
    try {
        await connectDB();
        // Clear existing data
        await Department.deleteMany();

        // Generate unique department names
        const departmentNames = new Set();
        while (departmentNames.size < count) {
            departmentNames.add(faker.commerce.department());
        }

        // Create and insert departments
        const departments = Array.from(departmentNames).map(name => ({ name }));
        await Department.insertMany(departments);

        console.log(`Successfully inserted ${departments.length} departments`);
    } catch (err) {
        console.error('Error populating departments:', err);
    } finally {
        mongoose.connection.close();
    }
};

// Call the function to populate data
populateDepartments(10); // Change the number to generate more or fewer departments
