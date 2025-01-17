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

    // Clear existing data
    await Student.deleteMany();
    await ExternalStudentPriorInfo.deleteMany();

    const gradeIds = await Grade.find();

    // Enum options
    const sexes = ['Male', 'Female'];
    const classifications = ['REGULAR', 'EVENING', 'DISTANCE'];
    const statuses = ['PASSED', 'FAILED', 'INCOMPLETE'];


    const students = [];
    // Generate students
    for (let i = 0; i < 20; i++) {
        const student = new Student({
            first_name: faker.name.firstName(),
            middle_name: faker.name.middleName(),
            last_name: faker.name.lastName(),
            sex: getRandomEnumValue(sexes),
            birth_date: faker.date.past(10, new Date()), // Students born before 10 years ago
            has_perior_school_info: false
        });
        students.push(student);
    }
    const savedNewStudents = await Student.insertMany(students);
    console.log('Students with perior false added:', savedNewStudents.length);


    students.length = 0;
    for (let i = 0; i < 100; i++) {
        const student = new Student({
            first_name: faker.name.firstName(),
            middle_name: faker.name.middleName(),
            last_name: faker.name.lastName(),
            sex: getRandomEnumValue(sexes),
            birth_date: faker.date.past(20, '2005-01-01'), // Students born before 2005
            has_perior_school_info: true
        });
        students.push(student);
    }
    const savedStudents = await Student.insertMany(students);
    console.log('Students with perior true added:', savedStudents.length);

    // Generate ExternalStudentPriorInfo
    const externalStudentInfo = [];
    for (let i = 0; i < 100; i++) {
        //const student = savedStudents[Math.floor(Math.random() * savedStudents.length)];
        const student = savedStudents[i];
        const info = new ExternalStudentPriorInfo({
            student: student._id,
            school_name: faker.company.companyName(),
            academic_year: faker.datatype.number({ min: 1970, max: 1974 }),//faker.random.number
            classification: getRandomEnumValue(classifications),
            grade: gradeIds[Math.floor(Math.random() * gradeIds.length)],
            average_result: faker.datatype.number({ min: 0, max: 100 }),
            status: getRandomEnumValue(statuses),
            transfer_reason: faker.lorem.sentence()
        });
        externalStudentInfo.push(info);
    }
    const savedExternalStudentInfo = await ExternalStudentPriorInfo.insertMany(externalStudentInfo);
    console.log('ExternalStudentPriorInfo added:', savedExternalStudentInfo.length);

    mongoose.connection.close();
}
//console.log('Current Directory:', process.cwd());
//console.log('MongoDB URL:', process.env.MONGO_URL);
populateData().catch(err => console.error(err));
console.log('check please');
