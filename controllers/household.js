const pool = require('../db');

async function createHousehold(req, res) {
  try {
    const { housingType } = req.body;
    const query = await pool.query(
      'INSERT INTO household_tab (household_type) VALUES ($1) RETURNING *',
      [housingType]
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
    if (name == "" || gender == "" || maritalStatus == "") {
      throw new Error("Input cannot be empty")
    } else if (annualIncome < 0) {
      throw new Error("Annual Income cannot be negative")
    } else {
      const query = await pool.query(
        'INSERT INTO family_member_tab (household_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [householdId, name, gender, maritalStatus, spouse, occupationType, annualIncome, dob]
      );
      res.status(200)
    }
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
    const householdRecords = await pool.query('SELECT * FROM household_tab');
    const households = generateEmptyHouseholdsObj(householdRecords.rows)
    const members = await pool.query('SELECT * FROM family_member_tab');
    if (members.rows.length == 0) {
      res.status(200).json(households)
    } else {
      members.rows.forEach(record => {
        const formattedDate = formatDate(record.date_of_birth)
        households[record.household_id]["members"][record.member_id] = {
          name: record.name,
          gender: record.gender,
          maritalStatus: record.marital_status,
          spouse: record.spouse,
          occupationType: record.occupation_type,
          annualIncome: record.annual_income,
          dob: formattedDate
        }
      })

      res.status(200).json(households);
    }
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
    if (!res["housingType"]) {
      res["housingType"] = record.household_type
    }

    if (!res["members"]) {
      res["members"] = {}
    }

    const formattedDate = formatDate(record.date_of_birth)
    res["members"][record.member_id] = {
      name: record.name,
      gender: record.gender,
      maritalStatus: record.marital_status,
      spouse: record.spouse,
      occupationType: record.occupation_type,
      annualIncome: record.annual_income,
      dob: formattedDate
    }
  })

  return res;
}

// Create an object that stores all household records where households are empty
function generateEmptyHouseholdsObj(householdRecords) {
  var res = {}
  householdRecords.forEach(record => {
    res[record.household_id] = {}
    res[record.household_id]["housingType"] = record.household_type
    res[record.household_id]["members"] = {}
  });

  return res;
}

function formatDate(date) {
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  return date.toISOString().split('T')[0]
}

module.exports = {createHousehold, createHouseholdMember, getHouseholds, searchHousehold}