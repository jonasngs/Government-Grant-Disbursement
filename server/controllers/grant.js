const pool = require('../db');

async function grantEligibility(req, res) {
  try {
    const { grantId } = req.params;
    if (grantId == 1) {
      
    } else if (grantId == 2) {

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

function studentEncouragementBonus() {
  const query = await pool.query('select household_id, count(*), sum(annual_income) from family_member_tab group by household_id;);
}

module.exports = {grantEligibility}