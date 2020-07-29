// src/components/NavBar.js

import React, {useState} from "react";
import { useAuth0 } from "../react-auth0-spa";

const NavBar = ({user, view, setView, team, teamsMembership, project, projectsMembership,
    waiting, setWaiting}) => {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

    const [isExpanded, setIsExpanded] = useState(false)

    // Get current team name
    let team_name = (team && teamsMembership) ? JSON.parse(teamsMembership).filter((x)=>x.id===team)[0].name : "";

    // Current project name
    let project_name = "";
    if (project && projectsMembership) {
        let filtered = JSON.parse(projectsMembership).filter((x)=>x.id===project);
        if (filtered.length) {
            project_name = JSON.parse(projectsMembership).filter((x)=>x.id===project)[0].name
        }
    }

    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            {!isAuthenticated && (
                <button onClick={() => loginWithRedirect({})} className="btn btn-primary">Log in</button>
            )}

            {/* NEW - add a link to the home and profile pages */}
            {isAuthenticated && (
                <ul className="navbar-nav ml-auto">

                    {view === "Home" ?
                        <b>Home</b> :
                        <a href="# " onClick={()=>(!waiting && setView("Home"))}>Home</a>
                    }

                    <div className="topbar-divider d-none d-sm-block" />

                    {view === "Team" ?
                        <b>Team: {team_name?team_name:"No team selected"}</b> :
                        team_name ?
                            <a href="# " onClick={()=>(!waiting && setView("Team"))}>Team: {team_name}</a> :
                            <i>Team: No team selected</i>
                    }

                    <div className="topbar-divider d-none d-sm-block" />

                    {view === "Project" ?
                        <b>Team: {project_name?project_name:"No project selected"}</b> :
                        project_name ?
                            <a href="# " onClick={()=>(!waiting && setView("Project"))}>Project: {project_name}</a> :
                            <i>Project: No project selected</i>
                    }
                </ul>
            )}
            <ul className="navbar-nav ml-auto">

                {(isAuthenticated && user) &&
                    <li className="nav-item dropdown no-arrow">
                        <a
                                className="nav-link dropdown-toggle"
                                href="# " id="userDropdown"
                                role="button"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded={isExpanded}
                                onClick={
                                    ()=>{
                                        setIsExpanded(!isExpanded)
                                    }
                                }
                        >
                            <div>
                                <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                                    {user.name}
                                </span>
                                <img className="img-profile rounded-circle" src={user.picture} alt="Profile"  />
                            </div>
                        </a>
                        <div className={"dropdown-menu dropdown-menu-right shadow animated--grow-in"+ (isExpanded?" show":"")} aria-labelledby="userDropdown">
                            <a className="dropdown-item" href="# " data-toggle="modal" data-target="#logoutModal" onClick={() => logout()}>
                                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                Logout
                            </a>
                        </div>
                    </li>
                }
            </ul>
        </nav>
    );
};

export default NavBar;
