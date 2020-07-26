// src/components/Dashboard.js
// Main dashboard component.

import React, { Fragment, Component, useState, useEffect } from "react";
import { useAuth0 } from "../react-auth0-spa";
import Teams from "./Teams";
import Projects from "./Projects";
import Issues from "./Issues";
import NavBar from "./NavBar";
import HomeView from "./HomeView"

const Dashboard = () => {
    const { loading, user } = useAuth0();
    const [teams, setTeams] = useState(0);
    const [teamsMembership, setTeamsMembership] = useState(0);
    const [team, setTeam] = useState(0); // The currently selected team, by id.
    const [view, setView] = useState("Home") // Which is the main pages is being viewed
    const [project, setProject] = useState(0); // The currently selected project, by id.
    const [projectlead, setProjectlead] = useState(0); // Leader of the currently selected project.
    const [teamMembers, setTeamMembers] = useState("[]");
    const [projects, setProjects] = useState(0);
    const [projectsMembership, setProjectsMembership] = useState(0);
    const [updateCount, setUpdateCount] = useState(0);
    const [waiting, setWaiting] = useState(0); // 1 if we are waiting for the server to return results, 0 otherwise

    useEffect(()=> {
        async function getTeams() {
            if (!user) {return}
            const response = await fetch('/teams',{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(user)
            });
            const my_teams = await response.json();

            const response_by_membership = await fetch('/teams_by_membership',{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(user)
            });
            const my_teams_by_membership = await response_by_membership.json();

            setTeams(my_teams.express);
            setTeamsMembership(my_teams_by_membership.express);
            setTeam(0); // If user changes, team should be disabled
        }
        getTeams();
    },[user, teams]); // Second parameter is a list of state variables, upon which changing should prompt calling the effect.
    // With the second parameter the empty array, the effect only runs when the component mounts.

    useEffect(()=> {
        async function getProjects() {
            if (!user) {return}
            const response = await fetch('/projects',{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({user:user, team:team})
            });
            const my_projects = await response.json();

            const response_by_membership = await fetch('/projects_by_membership',{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({user:user, team:team})
            });
            const my_projects_by_membership = await response_by_membership.json();

            setProjects(my_projects.express);
            setProjectsMembership(my_projects_by_membership.express);
            setProject(0); // If user or team changes, project should be disabled
            setProjectlead(0);
        }
        getProjects();
    },[user, team, updateCount]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div id="wrapper">
                <Sidebar
                    teams={teams}
                    setTeams={setTeams}
                    teamsMembership={teamsMembership}
                    setTeamsMembership={setTeamsMembership}
                    team={team}
                    setTeam={setTeam}
                    view={view}
                    setView={setView}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <NavBar
                            view={view}
                            setView={setView}
                            team={team}
                            teamsMembership={teamsMembership}
                            waiting={waiting}
                            setWaiting={setWaiting}
                        />
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-xl-6 col-lg-7">
                                    <p>Welcome to the Bug Tracker. Log in to get started.</p>
                                    <p>For more instructions or information on the project, see the <a href="https://github.com/michael-k-goff/bug-tracker" target="_blank">GitHub</a> repo.</p>
                                    <p>For more about the developer, see my <a href="https://github.com/michael-k-goff" target="_blank">GitHub</a> and <a href="https://michael-k-goff.github.io/" target="_blank">portfolio</a> pages.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer className="sticky-footer bg-white">
                        <div className="container my-auto">
                            <div className="copyright text-center my-auto">
                                <span>Copyright &copy; Michael Goff 2020</span>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }

    // Derive teams that one is a member of but not the lead.
    const lead_ids = JSON.parse(teams) ? JSON.parse(teams).map((x)=>x.id) : [];
    const teams_not_members = JSON.parse(teamsMembership) ?
        JSON.parse(teamsMembership).filter((x)=>lead_ids.indexOf(x.id)===-1) :
        [];
    const is_team_leader = lead_ids.indexOf(team) >= 0; // Leader of currently selected team

    return (
        <div id="wrapper">
            <Sidebar
                teams={teams}
                setTeams={setTeams}
                teamsMembership={teamsMembership}
                setTeamsMembership={setTeamsMembership}
                team={team}
                setTeam={setTeam}
                view={view}
                setView={setView}
                waiting={waiting}
                setWaiting={setWaiting}
            />
            <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                    <NavBar
                        user={user}
                        view={view}
                        setView={setView}
                        team={team}
                        teamsMembership={teamsMembership}
                        project={project}
                        projectsMembership={projectsMembership}
                        waiting={waiting}
                        setWaiting={setWaiting}
                    />
                    {view==="Home" && <HomeView
                        user={user}
                        teams={teams}
                        setTeams={setTeams}
                        waiting={waiting}
                        setWaiting={setWaiting}
                    />}
                    {(team && view === "Team") ?
                        <Projects
                            team={team}
                            teams={teams}
                            is_team_leader={is_team_leader}
                            view={view}
                            project={project}
                            setProject={setProject}
                            projectlead={projectlead}
                            setProjectlead={setProjectlead}
                            teamMembers={teamMembers}
                            setTeamMembers={setTeamMembers}
                            projects={projects}
                            setProjects={setProjects}
                            projectsMembership={projectsMembership}
                            setProjectsMembership={setProjectsMembership}
                            updateCount={updateCount}
                            setUpdateCount={setUpdateCount}
                            view={view}
                            setView={setView}
                            setTeams={setTeams}
                            setTeam={setTeam}
                            waiting={waiting}
                            setWaiting={setWaiting}
                        />
                        :
                        <Fragment></Fragment>
                    }
                    {(team && project && view === "Project") ?
                        <Issues
                            project={project}
                            projectlead={projectlead}
                            teamMembers={teamMembers}
                            projectsMembership={projectsMembership}
                            updateCountProject={updateCount}
                            setUpdateCountProject={setUpdateCount}
                            setProject={setProject}
                            setView={setView}
                            is_team_leader={is_team_leader}
                            waiting={waiting}
                            setWaiting={setWaiting}
                        /> :
                        (view === "Project" && <p>No issues</p>)
                    }
                </div>
                <footer className="sticky-footer bg-white">
                    <div className="container my-auto">
                        <div className="copyright text-center my-auto">
                            <span>Copyright &copy; Michael Goff 2020</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

const Sidebar = ({teams, setTeams, teamsMembership, setTeamsMembership, team, setTeam, view, setView}) => {
    return (
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            <a className="sidebar-brand d-flex align-items-center justify-content-center" href="#">
                <div className="sidebar-brand-text mx-3">
                    Bug Tracker
                </div>
            </a>
            <hr className="sidebar-divider my-0" />
            <Teams
                teams={teams}
                setTeams={setTeams}
                teamsMembership={teamsMembership}
                setTeamsMembership={setTeamsMembership}
                team={team}
                setTeam={setTeam}
                view={view}
                setView={setView}
            />
            <hr className="sidebar-divider my-0" />
            <div className="sidebar-heading">
                <b>About</b>
            </div>
            <li className="nav-item">
                <a className="nav-link" href="https://github.com/michael-k-goff/bug-tracker" target="_blank">
                    <span>This project on GitHub</span>
                </a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="https://github.com/michael-k-goff" target="_blank">
                    <span>Michael's GitHub page</span>
                </a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="https://michael-k-goff.github.io/" target="_blank">
                    <span>Michael's software portfolio</span>
                </a>
            </li>
        </ul>
    )
}

export default Dashboard;
