const Pool = require('pg').Pool
const credentials = require('./credentials');

const pool = new Pool(credentials.credentials);

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.send({express: JSON.stringify(results.rows)});
    })
}

const getUserById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

// A reverse to the above: given an email, get (an) ID.
const getUserId = (request, response) => {
    const email = request.body.email;

    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
        if (error) {
            throw error
        }
        response.send({express:JSON.stringify(results.rows)});
    })
}

const createUser = (request, response) => {
    const { name, email } = request.body

    pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`User added with ID: ${result.insertId}`)
    })
}

// Unlike createUser, this one checks if the user already exists
const addUser = (request, response) => {
    // Get name and email here, look over the rest
    const {name, email} = request.body;

    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length > 0) {
            response.send("");
        }
        else {
            pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`User added with ID: ${results.insertId}`)
            })
        }
    })
}

const updateUser = (request, response) => {
    const id = parseInt(request.params.id)
    const { name, email } = request.body

    pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User modified with ID: ${id}`)
        }
    )
}

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
        throw error
    }
        response.status(200).send(`User deleted with ID: ${id}`)
    })
}

// Get teams by leadership for a user.
const teams = (request, response) => {
    if (!request.body) {
        response.send({express: "Not logged in."});
        return;
    }
    let email = request.body.email;
    // Assume only one user with the email. Might need to modify table accordingly.
    pool.query('SELECT teams.* FROM teams INNER JOIN users ON teams.leader = users.id WHERE email = $1;',[email], (error, results) => {
    if (error) {
        throw error;
    }
        response.send({express: JSON.stringify(results.rows)});
    })
}

const teams_by_membership = (request, response) => {
    if (!request.body) {
        response.send({express: "Not logged in."});
        return;
    }
    let email = request.body.email;
    // Assume only one user with the email. Might need to modify table accordingly.
    pool.query('SELECT id FROM users WHERE email = $1;',[email], (error, results) => {
        if (error) {throw error;}
        if (results.rows.length === 0) {
            response.send({express: "No user found."}); // Shouldn't get here
        }
        let user_id = results.rows[0]["id"]; // Assume only one user with the email. Otherwise, defaults to the first.
        pool.query('SELECT teams.* FROM teams INNER JOIN memberships ON teams.id = memberships.team WHERE member = $1',[user_id],(error2,results2) => {
            if (error2) {throw error2;}
            response.send({express: JSON.stringify(results2.rows)});
        })
    })
}

// Get teams by leadership for a user.
const projects = (request, response) => {
    if (!request.body.user) {
        response.send({express: "Not logged in."});
        return;
    }
    let team = request.body.team;
    let email = request.body.user.email;

    pool.query('SELECT projects.* FROM projects INNER JOIN users ON projects.leader = users.id WHERE team = $1 AND email = $2;',[team, email], (error, results) => {
    if (error) {
        throw error;
    }
        response.send({express: JSON.stringify(results.rows)});
    })
}

const projects_by_membership = (request, response) => {
    if (!request.body) {
        response.send({express: "Not logged in."});
        return;
    }

    let team = request.body.team;
    let email = request.body.user.email;

    // This shouldn't necessary if the project membership is the same as the team membership, but I will keep it for now.
    pool.query('SELECT id FROM users WHERE email = $1;',[email], (error, results) => {
        if (error) {throw error;}
        if (results.rows.length === 0) {
            response.send({express: "No user found."}); // Shouldn't get here
        }
        let user_id = results.rows[0]["id"]; // Assume only one user with the email. Otherwise, defaults to the first.
        // This is being modified so that all team members are assumed to be on the project as well.
        // pool.query('SELECT projects.* FROM projects INNER JOIN project_memberships ON projects.id = project_memberships.project WHERE member = $1 AND team = $2',[user_id, team],(error2,results2) => {
        pool.query('SELECT * FROM projects WHERE team = $1',[team],(error2,results2) => {
            if (error2) {throw error2;}
            response.send({express: JSON.stringify(results2.rows)});
        })
    })
}

const issues = (request, response) => {
    if (!request.body) {
        response.send({express: "Not logged in."});
        return;
    }
    let project = request.body.project;
    pool.query('SELECT * FROM issues WHERE project = $1;',[project], (error, results) => {
        if (error) {throw error}
        response.send({express: JSON.stringify(results.rows)});
    })
}

const new_team = (request, response) => {
    if (!request.body.user) {
        response.send({express: "Not logged in."});
        return;
    }
    pool.query('SELECT * FROM users WHERE email = $1;',[request.body.user.email], (error, results) => {
        if (error) {throw error}
        let res = results.rows;
        if (res.length === 0) {
            response.send({express: "Email not matched"});
            return;
        }
        let user_id = res[0].id;
        pool.query('INSERT INTO teams (name, leader) VALUES ($1, $2) RETURNING *;',[request.body.teamname,user_id], (error2, results2) => {
            if (error2) {throw error2}
            let new_team_id = results2.rows[0].id;
            pool.query('INSERT INTO memberships (team, member) VALUES ($1, $2);',[new_team_id, user_id], (error_a, results_a) => {
                if (error_a) {throw error_a}
                pool.query('SELECT * FROM teams WHERE id = $1;',[user_id], (error3, results3) => {
                    if (error3) {throw error3}
                    response.send({express: JSON.stringify(results3.rows)})
                })
            })
        });
    });
}

const delete_team = (request, response) => {
    if (!request.body.user) {
        response.send({express: "Not logged in."});
        return;
    }
    pool.query('SELECT * FROM users WHERE email = $1;',[request.body.user.email], (error, results) => {
        if (error) {throw error}
        if (results.rows.length === 0) {
            response.send({express: "Email not matched"});
            return;
        }
        let user_id = results.rows[0].id;
        pool.query('DELETE FROM teams WHERE id = $1;',[request.body.team.id], (error2, results2) => {
            if (error2) {throw error2}
            pool.query('DELETE FROM issues USING projects WHERE issues.project = projects.id AND projects.team = $1;',[request.body.team.id], (error_a, results_a) => {
                if (error_a) {throw error_a}
                pool.query('DELETE FROM projects WHERE team = $1;',[request.body.team.id],(error_b, results_b) => {
                    if (error_b) {throw error_b}
                    pool.query('SELECT * FROM teams WHERE leader = $1;',[user_id], (error3, results3) => {
                        if (error3) {throw error3}
                        response.send({express: JSON.stringify(results3.rows)})
                    })
                })
            })
        });
    })
}

const new_project = (request, response) => {
    if (!request.body.user) {
        response.send({express: "Not logged in."});
        return;
    }
    pool.query('SELECT * FROM users WHERE email = $1;',[request.body.user.email], (error, results) => {
        if (error) {throw error}
        let res = results.rows;
        if (res.length === 0) {
            response.send({express: "Email not matched"});
            return;
        }
        let user_id = res[0].id;
        pool.query('INSERT INTO projects (name, team, leader) VALUES ($1, $2, $3);',[request.body.projectname, request.body.team, request.body.lead], (error2, results2) => {
            if (error) {throw error2}
            response.send({express: "hi"});
        });
    });
}

const delete_project = (request, response) => {
    if (!request.body.user) {
        response.send({express: "Not logged in."});
        return;
    }

    pool.query('SELECT * FROM users WHERE email = $1;',[request.body.user.email], (error, results) => {
        if (error) {throw error}
        if (results.rows.length === 0) {
            response.send({express: "Email not matched"});
            return;
        }

        let user_id = results.rows[0].id;
        pool.query('DELETE FROM projects WHERE id = $1;',[request.body.project.id], (error2, results2) => {
            if (error2) {throw error2}
            pool.query('DELETE FROM issues WHERE project = $1;',[request.body.project.id],(error3, results3) => {
                if (error3) {throw error3}
                response.send({express: "hi"});
            });
        });
    });
}

const team_members = (request, response) => {
    const team = request.body.team;
    pool.query('SELECT * FROM memberships INNER JOIN users ON memberships.member = users.id WHERE team = $1;',[team], (error, results) => {
        if (error) {throw error}
        response.send({express:JSON.stringify(results.rows)})
    })
}

const remove_member = (request, response) => {
    pool.query('DELETE FROM memberships WHERE team = $1 AND member = $2',[request.body.team, request.body.member], (error, results) => {
        if (error) {throw error}
        response.send({express:"hi"});
    })
}

const add_member = (request, response) => {
    if (!request.body.user) {
        response.send({express: "Not logged in."});
        return;
    }

    pool.query('SELECT * FROM users WHERE name = $1;',[request.body.membername],(error,results) => {
        if (error) {throw error}
        if (results.rows.length === 0) {
            response.send({express:"No such member found."})
            return;
        }
        let member_id = results.rows[0].id;
        pool.query('INSERT INTO memberships (team, member) VALUES ($1, $2) ON CONFLICT DO NOTHING;',[request.body.team,member_id],(error2, results2) => {
            if (error2) {throw error2}
            response.send({express:"Inserted."})
        })
    })
}

const add_member_email = (request, response) => {
    if (!request.body.user) {
        response.send({express: "Not logged in."});
        return;
    }

    pool.query('SELECT * FROM users WHERE email = $1;',[request.body.memberemail],(error,results) => {
        if (error) {throw error}
        if (results.rows.length === 0) {
            response.send({express:"No such member found."})
            return;
        }
        let member_id = results.rows[0].id;
        pool.query('INSERT INTO memberships (team, member) VALUES ($1, $2) ON CONFLICT DO NOTHING;',[request.body.team,member_id],(error2, results2) => {
            if (error2) {throw error2}
            response.send({express:"Inserted."})
        })
    })
}

const new_issue = (request, response) => {
    if (!request.body.user) {
        response.send({express: "Not logged in."});
        return;
    }
    const project = request.body.project;
    const owner = request.body.lead;
    const issuedesc = request.body.issuedesc;
    pool.query('INSERT INTO issues (project, description, owner) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;',[project, issuedesc, owner], (error, results) => {
        if (error) {throw error}
        response.send({express: "hi"});
    });
}

const close_issue = (request, response) => {
    if (!request.body.user) {
        response.send({express: "Not logged in."});
        return;
    }
    const issue = request.body.issue;
    pool.query('DELETE FROM issues WHERE id = $1;',[issue],(error, results) => {
        if (error) {throw error}
        response.send({express:"hi"})
    })
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    addUser,
    teams,
    teams_by_membership,
    projects,
    projects_by_membership,
    issues,
    getUserId,
    new_team,
    delete_team,
    new_project,
    delete_project,
    team_members,
    remove_member,
    add_member,
    add_member_email,
    new_issue,
    close_issue
}
