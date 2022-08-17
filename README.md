## Government Disbursement Grant backend task for TAP

Built using NodeJs, Express and PostgreSQL

This application has been deployed to heroku and can be accessed at: `https://government-disbursement-tap.herokuapp.com/`

To test the APIs, do use API testing tools such as `Postman`

To run the application locally:

Requires the latest versions of npm, node and postgresql

To run the application:

1. To clone the repo, run `git clone https://github.com/jonasngs/Government-Grant-Disbursement.git`

2. In the root directory, run `npm install` to install all server side dependencies.

3. As the data persists in a PostgreSQL database, you will need to have the latest version of PostgreSQl installed.

4. Follow the table schema in `database.sql` file to create the necessary database and table.

5. Ensure that the PostgreSQL credentials in `.env` file are updated to match your local PostgreSQL server credentials

6. In the root directory, run `node index` to start the server instance

7. Enter `http://localhost:5000` on your browser to access the Government Disbursement Grant Backend application

<br>

User instructions for accessing APIs:

This backend application offers the following APIs:

1. [POST] `/api/households`: To create a new household.
This API creates a new household, and the housing type is specified in the request body under the `housingType` field <br>
***Take note*** that the household type is case sensitive and only accepts the 3 options: Landed, Condominium, HDB.
An example request body in JSON format:
```
{
	"housingType": "HDB"
}
```
<br>

2. [POST] `/api/households/:householdId/members`: To create a new household member.
This API creates a new household member, and the household ID of household which the member will be added to is specified as a query parameter `householdId`<br>
***Take note*** that the name, gender, marital status occupation type cannot be empty. The annual income has to be a non-negative value. The gender field is case sensitive and only accepts 2 options: Male, Female. The occupation type is case sensitive and only accepts 3 options: Unemployed, Student, Employed. The date of birth field has to be a valid date and only accepts the following format: `YYYY-MM-DD`.
<br>
An example request body in JSON format:

```
{
	"name": "John",
	"gender": "Male",
	"maritalStatus": "Single",
	"spouse": "",
	"occupationType": "Student",
	"annualIncome": 1000,
	"dob": "2022-02-20"
}
```
<br>

3. [GET] `/api/households`: Gets a list of all the households.
The return value is a JSON object containing the unique household ID as a key, and a household object as the value. Within each household object, it indicates the household type, as well as all members belonging to that household. For each member object, the unique member id will serve as the key, with the member details as the value.
<br>
An example JSON response:

```
{
    "27": {
        "housingType": "Condominium",
        "members": {}
    },
    "29": {
        "housingType": "HDB",
        "members": {}
    },
    "30": {
        "housingType": "Landed",
        "members": {
            "62": {
                "name": "John",
                "gender": "Male",
                "maritalStatus": "Single",
                "spouse": "",
                "occupationType": "Student",
                "annualIncome": "11110",
                "dob": "2022-02-20"
            }
        }
    }
}
```
<br>

4. [GET] `/api/households/:householdId`: Searches for a household based on the unqiue household ID. The household ID is present in the query parameter as `householdId`. The return value is a JSON similar to that in API 3.

<br>

5. [GET] `/api/grants/:grantId` Checks the eligibility of household grants and returns the households and eligible members. 
<br>
Each grant can be uniquely identified by a grant ID as follows: <br>

[1] Student Encouragement Bonus <br>
[2] Multigeneration Scheme <br>
[3] Elder Bonus <br>
[4] Baby Sunshine Grant <br>
[5] YOLO GST Grant
<br>

For each grant, the grant ID must be provided in the query parameter `grandId`. The return result is a JSON object that is similar to the return result of APIs 3 and 4.