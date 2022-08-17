CREATE DATABASE grant_disbursement_db;

CREATE TABLE household_tab(
    household_id SERIAL PRIMARY KEY,
    household_type VARCHAR(20) CHECK (household_type = 'Landed' OR household_type = 'Condominium' OR household_type = 'HDB')
);

CREATE TABLE family_member_tab(
  member_id SERIAL PRIMARY KEY,
  household_id INT NOT NULL,
  name VARCHAR(64) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender = 'Male' OR gender = 'Female'),
  marital_status VARCHAR(20) NOT NULL,
  spouse VARCHAR(64) DEFAULT '',
  occupation_type VARCHAR(20) NOT NULL CHECK (occupation_type = 'Unemployed' OR occupation_type = 'Student' OR occupation_type = 'Employed'),
  annual_income BIGINT NOT NULL,
  date_of_birth DATE NOT NULL,
  constraint fk_family_household FOREIGN KEY(household_id) REFERENCES household_tab(household_id)
);