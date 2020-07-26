// src/components/Teams.js
// Component that displays list of teams

import React, { Fragment, Component, useState, useEffect } from "react";
import { useAuth0 } from "../react-auth0-spa";
import Projects from "./Projects";

const Teams = ({teams, setTeams, teamsMembership, setTeamsMembership, team, setTeam, view, setView, waiting, setWaiting}) => {
    const { loading, user } = useAuth0();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || !teams || !teamsMembership) {
        return <li className="nav-item">
            <a className="nav-link" href="#">
                <span>Not logged in</span>
            </a>
        </li>
    }

    // Derive teams that one is a member of but not the lead.
    const lead_ids = JSON.parse(teams) ? JSON.parse(teams).map((x)=>x.id) : [];
    const teams_not_members = JSON.parse(teamsMembership) ?
        JSON.parse(teamsMembership).filter((x)=>lead_ids.indexOf(x.id)===-1) :
        [];
    const is_team_leader = lead_ids.indexOf(team) >= 0; // Leader of currently selected team

    return (
        <Fragment>
            <div className="sidebar-heading">
                <b>{lead_ids.length ? "Teams I lead" : "Teams I lead (None found)"}</b>
            </div>

            {teams.length > 0 &&
                <TeamList
                    teams={JSON.parse(teams)}
                    setTeam={setTeam}
                    setTeams={setTeams}
                    user={user}
                    is_leader={1}
                    view={view}
                    setView={setView}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />
            }
            <hr className="sidebar-divider my-0" />
            <div className="sidebar-heading">
                <b>{teams_not_members.length ? "Other teams I belong to" : "Other teams I belong to (none found)"}</b>
            </div>
            {teams_not_members.length > 0 &&
                <TeamList
                    teams={teams_not_members}
                    setTeam={setTeam}
                    setTeams={setTeams}
                    user={user}
                    is_leader={0}
                    view={view}
                    setView={setView}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />
            }
        </Fragment>
    );
};

// Component to render a list of teams
const TeamList = ({teams, setTeam, setTeams, user, is_leader, view, setView, waiting, setWaiting}) => {
    return (
        <>
            {teams.map((team)=> {
                return <TeamSelector
                    team={team}
                    key={team.id}
                    setTeam={setTeam}
                    setTeams={setTeams}
                    user={user}
                    is_leader={is_leader}
                    view={view}
                    setView={setView}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />
            })}
        </>
    )
}

// Selector, including possible deletion button, for a single team
const TeamSelector = ({team, setTeam, setTeams, user, is_leader, view, setView, waiting, setWaiting}) => {
    return (
        <div>
            <TeamButton team={team} setTeam={setTeam} view={view} setView={setView} waiting={waiting} setWaiting={setWaiting}/>
        </div>
    )
}

// Component for an individual team button
// Not actually a button anymore
const TeamButton = ({team, setTeam, view, setView, waiting, setWaiting}) => {
    const handleClick = () => {
        if (waiting) {return}
        setTeam(team.id);
        setView("Team");
    }
    return (
        <li className="nav-item" onClick={handleClick}>
            <a className="nav-link" href="#">
                <span>{team.name}</span>
            </a>
        </li>
    )
}

export default Teams;
