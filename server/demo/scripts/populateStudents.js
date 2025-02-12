const mongoose = require('mongoose');
const faker = require('faker'); // For generating random data
const Student = require('../../models/student');
const ExternalStudentPriorInfo = require('../../models/external-student-info');
const Grade = require('../../models/grade');
require('dotenv').config();

async function connectDB() {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
}

function getRandomEnumValue(enumArray) {
    return enumArray[Math.floor(Math.random() * enumArray.length)];
}

async function populateData() {
    await connectDB();
    //await Student.deleteMany();
    const sexes = ['Male', 'Female'];
    const students = [];
    for (let i = 0; i < 30; i++) {
        const student = new Student({
            first_name: faker.name.firstName(),
            middle_name: faker.name.middleName(),
            last_name: faker.name.lastName(),
            sex: getRandomEnumValue(sexes),
            birth_date: faker.date.past(10, new Date()), // Students born before 10 years ago
        });
        students.push(student);
    }
    const savedNewStudents = await Student.insertMany(students);
    console.log('Students with perior false added:', savedNewStudents.length);
    mongoose.connection.close();
}

populateData().catch(err => console.error(err));
console.log('check please');
