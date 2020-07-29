// A script to reset the database for the bug tracker project to some preset values.

const Pool = require('pg').Pool
const credentials = require('./credentials');

const pool = new Pool(credentials.credentials);

async function make_db() {
	// Users
	await pool.query('DROP TABLE IF EXISTS users;');
	await pool.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name varchar(30), email varchar(30));');
	await pool.query("INSERT INTO users (name, email) VALUES ('Jerry','jerry@example.com'), ('George','george@example.com'), ('Michael Goff','michael.k.goff@gmail.com'), ('asdf@asdf.com','asdf@asdf.com');");

	// Teams
	await pool.query('DROP TABLE IF EXISTS teams;');
	await pool.query('CREATE TABLE IF NOT EXISTS teams (id SERIAL PRIMARY KEY, name varchar(30), leader int NOT NULL);');
	await pool.query("INSERT INTO teams (name, leader) VALUES ('TPS',3), ('Starship',3), ('Team Blue',1), ('Team Red',2);");

	// Memberships, including which users are members of which teams. Should include team leaders.
	await pool.query('DROP TABLE IF EXISTS memberships;');
	await pool.query('CREATE TABLE IF NOT EXISTS memberships (team int, member int, UNIQUE (team, member));');
	// Making some assumptions about the relative numbers of teams and members. Consider a more systematic way of extracting the desired values.
	await pool.query('INSERT INTO memberships (team, member) VALUES (1,3), (2,3), (3,3), (2,4), (2,2);');

	// Projects
	await pool.query('DROP TABLE IF EXISTS projects;');
	await pool.query('CREATE TABLE IF NOT EXISTS projects (id SERIAL PRIMARY KEY, name varchar(30), team int, leader int NOT NULL);');
	await pool.query("INSERT INTO projects (name, team, leader) VALUES ('Daedalus',2,3), ('Icarus',2,3), ('Valkyrie',2,3), ('The TTP Project',1,3), ('Starship Enterprise',2,2);");
    await pool.query("INSERT INTO projects (name, team, leader) VALUES ('Blue Cow',3,3);");

	// Project memberships, including which users are members of which projects. Should include project leaders.
	// For now, commenting them out and treating membership of projects as identical to their containing teams.
	// await pool.query('DROP TABLE IF EXISTS project_memberships;');
	// await pool.query('CREATE TABLE IF NOT EXISTS project_memberships (project int, member int);');
	// await pool.query('INSERT INTO project_memberships (project, member) VALUES (1,3), (2,3), (3,3), (4,3);');

	// Issues
	await pool.query('DROP TABLE IF EXISTS issues;');
	await pool.query('CREATE TABLE IF NOT EXISTS issues (id SERIAL PRIMARY KEY, project int NOT NULL, description varchar(255), owner int);');
	await pool.query("INSERT INTO issues (project, description, owner) VALUES (3,'Choose destination',3), (3,'Build engine',3), (3,'Produce antimatter',3), (3,'Launch!',3), (3,'Colonize destination',3);");
	await pool.query("INSERT INTO issues (project, description, owner) VALUES (3,'Find bathroom',2);");
    await pool.query("INSERT INTO issues (project, description, owner) VALUES (4,'Recurse Acronym',3);");
    await pool.query("INSERT INTO issues (project, description, owner) VALUES (5,'Engage',2);");

	pool.end();
}
make_db()
