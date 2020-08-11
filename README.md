# Bug Tracker

This project is a system for teams to track bugs and other issues on a project-by-project basis.

## Instructions

Once logged in with Auth0, create a new team on the Home tab (tabs can be selected via the navigation bar at the top). Then on the Team tab, create one or more projects. As an individual, you can the app as a personal to-do list by creating and marking off issues.

A new person can be added to the team, by name or email, if they have signed in via Auth0. Every member of a team has access to all of the team's projects as well.

Only a team leader can create new projects, close projects, or delete the team as a whole. The team leader assigns a project manager when creating a project. The project manager opens issues and assigns them to members of team. Either a project manager or the person to whom an issue is assigned can declare an issue closed.

## Implementation

The bug tracker is implemented as follows.

- The project front end was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
- The back end is implemented in Node.js and employed to an AWS EC2 instance.
- Data on users, projects, teams, and open issues is stored in a PostgresQL database deployed at Amazon RDS.
- Authentication is handled through [Auth0](https://auth0.com/).
- The app is styled with [SB Admin 2](https://startbootstrap.com/themes/sb-admin-2/), a Bootstrap theme.

## Further Work

I see the following areas for potential improvement.

- Deadline dates and times for issues to be resolved.
- Ability to sort issues, particularly by deadline.
- Mechanisms to transfer leadership of projects and teams.
- A mechanism to revise open issues without clearing and recreating them.
- Mechanisms to invite new team members and to request membership to a team. Both the team leader and new member would have to consent.
