const mongoose = require('mongoose');
const faker = require('faker');
const Teacher = require('../../models/teacher'); 
const Department = require('../../models/department'); 
require('dotenv').config();

async function connectDB() {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
}

const populateTeachers = async (count = 10) => {
    try {
        await connectDB();
        // Fetch all department IDs
        const departments = await Department.find({}, '_id').exec();
        if (departments.length === 0) {
            console.log('No departments found. Please populate departments first.');
            return;
        }

        // Clear existing teacher data
        // await Teacher.deleteMany();

        // Generate teachers
        const teachers = [];
        for (let i = 0; i < count; i++) {
            const randomDepartment = departments[Math.floor(Math.random() * departments.length)];
            teachers.push({
                department: randomDepartment._id,
                first_name: faker.name.firstName(),
                middle_name: faker.name.middleName(),
                last_name: faker.name.lastName(),
                sex: faker.helpers.randomize(['Male', 'Female']),
            });
        }
        // Insert teachers into the database
        await Teacher.insertMany(teachers);
        console.log(`Successfully inserted ${teachers.length} teachers`);
    } catch (err) {
        console.error('Error populating teachers:', err);
    } finally {
        mongoose.connection.close();
    }
};

// Call the function to populate data
populateTeachers(10); // Change the number to generate more or fewer teachers
