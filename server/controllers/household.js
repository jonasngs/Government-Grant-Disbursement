const pool = require('../db');

async function createHousehold(req, res) {
  try {
    const { householdType } = req.body;
    console.log(householdType);
    const query = await pool.query(
      'INSERT INTO household_tab (household_type) VALUES ($1) RETURNING *',
      [householdType]
    );
    res.status(200)
  } catch (err) {
    if (err.code == 23514) {
      res.status(400).json({error: "Input is not included in valid options"})
    } else {
      res.status(400).json({error: err.message})
    }
  }
}

async function createHouseholdMember(req, res) {
  try {
    const { householdId } = req.params;
    const { name, gender, maritalStatus, spouse, occupationType, annualIncome, dob } = req.body;
    const query = await pool.query(
      'INSERT INTO family_member_tab (household_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [householdId, name, gender, maritalStatus, spouse, occupationType, annualIncome, dob]
    );
    res.status(200)
  } catch (err) {
    if (err.code == 23514) {
      res.status(400).json({error: "Input is not included in valid options"})
    } else {
      res.status(400).json({error: err.message})
    }
  }
}

async function getHouseholds(req, res) {
  try {
    const householdRecords = await pool.query(
      'SELECT household_tab.household_id, household_type, member_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth::date FROM household_tab '+
      'INNER JOIN family_member_tab on household_tab.household_id = family_member_tab.household_id'
    );
    const households = generateHouseholdsObj(householdRecords.rows)
    res.status(200).json(households)
  } catch (err) {
    res.status(400).json({error: err.message})
  }
}

async function searchHousehold(req, res) {
  try {
    const { householdId } = req.params;

    const query = await pool.query('SELECT * from household_tab WHERE household_id = $1', [householdId]);
    if (query.rows.length == 0) { // Household does not exist
      throw new Error("Household does not exist");
    } else {
      const householdRecord = await pool.query(
        'SELECT household_type, member_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth::date FROM household_tab '+
        'INNER JOIN family_member_tab on household_tab.household_id = family_member_tab.household_id WHERE household_tab.household_id = $1',
        [householdId]
      );
      
      if (householdRecord.rows.length == 0) { // Household has no members
        res.status(200).json({ 
          householdType: query.rows[0].household_type, 
          members: {}
        })
      } else {
        const members = generateHouseholdObj(householdRecord.rows);
        res.status(200).json(members);
      }
    }
  } catch (err) {
    res.status(400).json({error: err.message});
  }
}

// Create an object that stores a single household record
function generateHouseholdObj(memberRecords) {
  const res = {}
  memberRecords.forEach(record => {
    if (!res["householdType"]) {
      res["householdType"] = record.household_type
    }

    if (!res["members"]) {
      res["members"] = {}
    }

    res["members"][record.member_id] = {
      name: record.name,
      gender: record.gender,
      maritalStatus: record.marital_status,
      spouse: record.spouse,
      occupationType: record.occupation_type,
      annualIncome: record.annual_income,
      dob: record.date_of_birth
    }
  })

  return res;
}

// Create an object that stores all household records
function generateHouseholdsObj(householdRecords) {
  const res = {}
  householdRecords.forEach(record => {
    if (!res[record.household_id]) {
      res[record.household_id] = {}
    }

    if (!res[record.household_id]["householdType"]) {
      res[record.household_id]["householdType"] = record.household_type;
    }

    if (!res[record.household_id]["familyMembers"]) {
      res[record.household_id]["familyMembers"] = {}
    }
    
    res[record.household_id]["familyMembers"][record.member_id] = {
      name: record.name,
      gender: record.gender,
      maritalStatus: record.marital_status,
      spouse: record.spouse,
      occupationType: record.occupation_type,
      annualIncome: record.annual_income,
      dob: record.date_of_birth
    }
  });

  return res;
}

function formatDate(date) {
  var dateValue = new Date(date)
  var year = dateValue.getFullYear()
  var month = dateValue.getFullYear()
  var year = dateValue.getFullYear()
}

module.exports = {createHousehold, createHouseholdMember, getHouseholds, searchHousehold}