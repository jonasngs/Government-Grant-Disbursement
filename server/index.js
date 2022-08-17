const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const { createHousehold, createHouseholdMember, getHouseholds, searchHousehold } = require("./controllers/household");
const { grantEligibility } = require("./controllers/grant");

// Middleware
app.use(cors());
app.use(express.json());

// Household APIs

// Create household
app.post('/api/households', createHousehold);

// Create household member
app.post('/api/households/:householdId/members', createHouseholdMember);

// List all households
app.get('/api/households', getHouseholds);

// Search for a household
app.get('/api/households/:householdId', searchHousehold);

// Grant APIs

// Check grant eligibility
app.get('/api/grants/:grantId', grantEligibility);

app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});



