const pool = require('../db');

async function grantEligibility(req, res) {
  try {
    const { grantId } = req.params;
    if (grantId == 1) {
      const eligibleMembers = await studentEncouragementBonus()
      res.status(200).json(eligibleMembers)
    } else if (grantId == 2) {
      const eligibleMembers = await multigenerationalScheme()
      res.status(200).json(eligibleMembers)
    } else if (grantId == 3) {
      
    } else if (grantId == 4) {
      
    } else if (grantId == 5) {
      
    } else {
      throw new Error("Invalid grant type")
    }
  } catch (err) {
    res.status(400).json({error: err.message})
  }
}

async function studentEncouragementBonus() {
  try {
    const epoch = getEpochCutOff(16, 0, 0);
    const eligibleHouseholdsbyAge = await pool.query('SELECT household_id, sum(annual_income) from family_member_tab WHERE date_of_birth > $1 AND occupation_type = $2 group by household_id',
      [epoch, "Student"]
    );

    const eligibleHouseholds = eligibleHouseholdsbyAge.rows.filter(function (element) {
      return element.sum < 200000;
    });

    let householdIds = []

    eligibleHouseholds.forEach(record => {
      householdIds.push(record.household_id)
    })

    if (householdIds.length == 0) {
      return {};
    } else {
      var whereClause = ""

      for (let i = 1; i <= householdIds.length; i++) {
        whereClause += "household_tab.household_id = $" + `${i}`
        if (i != householdIds.length) {
          whereClause += " OR "
        }
      }

      const query = `SELECT household_tab.household_id, household_type, member_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth FROM household_tab `+
      `INNER JOIN family_member_tab on household_tab.household_id = family_member_tab.household_id WHERE (${whereClause}) AND date_of_birth > ${"$"+(householdIds.length + 1).toString()}`
      
      householdIds.push(epoch)
      
      const eligibleMembers = await pool.query(query,
        householdIds
      );
      
      return generateHouseholdsObj(eligibleMembers.rows);
    }
  } catch (err) {
    throw err;
  }
}

async function multigenerationalScheme() {
  try {
    const lowerLimit = getEpochCutOff(-16, 0, 0);
    const upperLimit = getEpochCutOff(-55, 0, 0)
    const eligibleHouseholdsbyAge = await pool.query('SELECT household_id, sum(annual_income) from family_member_tab WHERE date_of_birth > $1 OR date_of_birth < $2 group by household_id',
      [lowerLimit, upperLimit]
    );

    const eligibleHouseholds = eligibleHouseholdsbyAge.rows.filter(function (element) {
      return element.sum < 150000;
    });

    let householdIds = []

    eligibleHouseholds.forEach(record => {
      householdIds.push(record.household_id)
    })

    if (householdIds.length == 0) {
      return {};
    } else {
      var whereClause = ""

      for (let i = 1; i <= householdIds.length; i++) {
        whereClause += "household_tab.household_id = $" + `${i}`
        if (i != householdIds.length) {
          whereClause += " OR "
        }
      }

      const query = `SELECT household_tab.household_id, household_type, member_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth FROM household_tab `+
      `INNER JOIN family_member_tab on household_tab.household_id = family_member_tab.household_id WHERE (${whereClause})`
      
      const eligibleMembers = await pool.query(query,
        householdIds
      );
      
      return generateHouseholdsObj(eligibleMembers.rows);
    }
  } catch (err) {
    throw err;
  }
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

    if (!res[record.household_id]["qualifyingMembers"]) {
      res[record.household_id]["qualifyingMembers"] = {}
    }
    const dob = generateDate(record.date_of_birth)
    res[record.household_id]["qualifyingMembers"][record.member_id] = {
      name: record.name,
      gender: record.gender,
      maritalStatus: record.marital_status,
      spouse: record.spouse,
      occupationType: record.occupation_type,
      annualIncome: record.annual_income,
      dob: dob
    }
  });

  return res;
}


// Retrieves the epoch value of the cut off date time for eligibility of grant
function getEpochCutOff(years, months, days) {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var cutOffDate = new Date(year + years, month + months, day + days)
  return Math.floor(cutOffDate.getTime() / 1000)
}

// Converts epoch date time to date string in the format: YYYY-MM-DD
function generateDate(epoch) {
  var dateTime = new Date(epoch*1000).toLocaleString();
  var date = dateTime.split(",")[0].split(" ")[0]
  const [ day, month, year ] = date.split("/")
  return year + "-" + month + "-" + day;
}

module.exports = {grantEligibility}