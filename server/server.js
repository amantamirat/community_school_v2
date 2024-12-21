const express = require('express');
const app = express();
const port = 3000;

// Basic route to handle requests
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const { getPreviousGrade } = require('./utils/utils'); // Import the function
console.log(getPreviousGrade('PRM_MID', 4, 'GEN')); 