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
      const eligibleMembers = await elderBonus()
      res.status(200).json(eligibleMembers)
    } else if (grantId == 4) {
      const eligibleMembers = await babySunshine()
      res.status(200).json(eligibleMembers)
    } else if (grantId == 5) {
      const eligibleMembers = await yoloGST()
      res.status(200).json(eligibleMembers)
    } else {
      throw new Error("Invalid grant type")
    }
  } catch (err) {
    res.status(400).json({error: err.message})
  }
}

async function studentEncouragementBonus() {
  try {
    const cutOffDate = getDateLimit(-16, 0, 0);
    let eligibleHouseholdsbyIncome = await pool.query("SELECT household_id, SUM(annual_income) FROM family_member_tab GROUP BY household_id");
    eligibleHouseholdsbyIncome = eligibleHouseholdsbyIncome.rows.filter(function (element) {
      return element.sum < 200000;
    });

    let params = []

    eligibleHouseholdsbyIncome.forEach(record => {
      params.push(record.household_id)
    })

    if (params.length == 0) {
      return {};
    } else {
      var whereClause = ""

      for (let i = 1; i <= params.length; i++) {
        whereClause += "household_id = $" + `${i}`
        if (i != params.length) {
          whereClause += " OR "
        }
      }

      let query = `SELECT household_id FROM family_member_tab WHERE (${whereClause}) AND date_of_birth > ${"$"+(params.length + 1).toString()}`
      params.push(cutOffDate)
      const eligibleHouseholds = await pool.query(query, params);

      params = []

      eligibleHouseholds.rows.forEach(record => {
        params.push(record.household_id)
      })

      if (params.length == 0) {
        return {};
      } else {
        whereClause = ""

        for (let i = 1; i <= params.length; i++) {
          whereClause += "household_tab.household_id = $" + `${i}`
          if (i != params.length) {
            whereClause += " OR "
          }
        }

        query = `SELECT household_tab.household_id, household_type, member_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth FROM household_tab `+
        `INNER JOIN family_member_tab on household_tab.household_id = family_member_tab.household_id WHERE (${whereClause}) AND date_of_birth > ${"$"+(params.length + 1).toString()}`
        
        params.push(cutOffDate)
        
        const eligibleMembers = await pool.query(query, params);
        
        return generateHouseholdsObj(eligibleMembers.rows);
      }
    }
  } catch (err) {
    throw err;
  }
}

async function multigenerationalScheme() {
  try {
    const upperLimit = getDateLimit(-18, 0, 0);
    const lowerLimit = getDateLimit(-55, 0, 0);
    let eligibleHouseholdsbyIncome = await pool.query("SELECT household_id, SUM(annual_income) FROM family_member_tab GROUP BY household_id");
    
    eligibleHouseholdsbyIncome = eligibleHouseholdsbyIncome.rows.filter(function (element) {
      return element.sum < 150000;
    });

    let params = []

    eligibleHouseholdsbyIncome.forEach(record => {
      params.push(record.household_id)
    })

    if (params.length == 0) {
      return {};
    } else {
      var whereClause = ""

      for (let i = 1; i <= params.length; i++) {
        whereClause += "household_id = $" + `${i}`
        if (i != params.length) {
          whereClause += " OR "
        }
      }

      let query = `SELECT household_id FROM family_member_tab WHERE (${whereClause}) AND date_of_birth > ${"$"+(params.length + 1).toString()} OR date_of_birth < ${"$"+(params.length + 2).toString()}`
      params.push(upperLimit, lowerLimit)
      const eligibleHouseholds = await pool.query(query, params);

      params = []

      eligibleHouseholds.rows.forEach(record => {
        params.push(record.household_id)
      })
  
      if (params.length == 0) {
        return {};
      } else {
        var whereClause = ""
  
        for (let i = 1; i <= params.length; i++) {
          whereClause += "household_tab.household_id = $" + `${i}`
          if (i != params.length) {
            whereClause += " OR "
          }
        }
  
        const query = `SELECT household_tab.household_id, household_type, member_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth FROM household_tab `+
        `INNER JOIN family_member_tab on household_tab.household_id = family_member_tab.household_id WHERE (${whereClause})`
        
        const eligibleMembers = await pool.query(query, params);
        
        return generateHouseholdsObj(eligibleMembers.rows);
      }
    }
  } catch (err) {
    throw err;
  }
}

async function elderBonus() {
  try {
    const cutOffDate = getDateLimit(-55, 0, 0);

    let query = "SELECT t1.household_id FROM (SELECT household_id FROM household_tab WHERE household_type = $1) t1 join (SELECT household_id FROM family_member_tab where date_of_birth < $2 ) t2 ON t1.household_id = t2.household_id GROUP BY t1.household_id";

    const eligibleHouseholds = await pool.query(query,
      ['HDB', cutOffDate]
    );

    let params = []

    eligibleHouseholds.rows.forEach(record => {
      params.push(record.household_id)
    })

    if (params.length == 0) {
      return {};
    } else {
      var whereClause = ""

      for (let i = 1; i <= params.length; i++) {
        whereClause += "household_tab.household_id = $" + `${i}`
        if (i != params.length) {
          whereClause += " OR "
        }
      }

      query = `SELECT household_tab.household_id, household_type, member_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth FROM household_tab `+
      `INNER JOIN family_member_tab on household_tab.household_id = family_member_tab.household_id WHERE (${whereClause}) AND date_of_birth <= ${"$"+(params.length + 1).toString()}`
      
      params.push(cutOffDate)

      const eligibleMembers = await pool.query(query, params);
      
      return generateHouseholdsObj(eligibleMembers.rows);
    }
  } catch (err) {
    throw err;
  }
}

async function babySunshine() {
  try {
    const cutOffDate = getDateLimit(0, -8, 0);

    let query = "SELECT * FROM family_member_tab WHERE date_of_birth > $1";

    const eligibleMembers = await pool.query(query,
      [cutOffDate]
    );
      return generateHouseholdsObj(eligibleMembers.rows);
  } catch (err) {
    throw err;
  }
}

async function yoloGST() {
  try {
    const cutOffDate = getDateLimit(-55, 0, 0);

    let query = "SELECT t1.household_id FROM (SELECT household_id FROM household_tab WHERE household_type = $1) t1 join (SELECT household_id FROM family_member_tab where date_of_birth < $2 ) t2 ON t1.household_id = t2.household_id GROUP BY t1.household_id";

    const eligibleHouseholds = await pool.query(query,
      ['HDB', cutOffDate]
    );

    let params = []

    eligibleHouseholds.rows.forEach(record => {
      params.push(record.household_id)
    })

    if (params.length == 0) {
      return {};
    } else {
      var whereClause = ""

      for (let i = 1; i <= params.length; i++) {
        whereClause += "household_tab.household_id = $" + `${i}`
        if (i != params.length) {
          whereClause += " OR "
        }
      }

      query = `SELECT household_tab.household_id, household_type, member_id, name, gender, marital_status, spouse, occupation_type, annual_income, date_of_birth FROM household_tab `+
      `INNER JOIN family_member_tab on household_tab.household_id = family_member_tab.household_id WHERE (${whereClause}) AND date_of_birth <= ${"$"+(params.length + 1).toString()}`
      
      params.push(cutOffDate)

      const eligibleMembers = await pool.query(query, params);
      
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
    const dob = formatDate(record.date_of_birth)
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


// Retrieves the cut off date for eligibility of grant
function getDateLimit(years, months, days) {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var cutOffDate = new Date(year + years, month + months, day + days)
  return cutOffDate.toISOString().split('T')[0]
}

function formatDate(date) {
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  return date.toISOString().split('T')[0]
}

module.exports = {grantEligibility}