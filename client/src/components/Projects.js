// src/components/Projects.js
// Component that displays list of projects

import React from "react";
import { useAuth0 } from "../react-auth0-spa";
import TeamMembers from "./TeamMembers";

const Projects = ({team, teams, is_team_leader,
    project, setProject, projectlead, setProjectlead, teamMembers, setTeamMembers,
    projects, setProjects, projectsMembership, setProjectsMembership,
    updateCount, setUpdateCount, view, setView, setTeams, setTeam, waiting, setWaiting}) => {
    const { user } = useAuth0();

    // Derive projects that one is a member of but not the lead.
    const lead_ids = JSON.parse(projects) ? JSON.parse(projects).map((x)=>x.id) : [];
    const projects_not_members = JSON.parse(projectsMembership) ?
        JSON.parse(projectsMembership).filter((x)=>lead_ids.indexOf(x.id)===-1) :
        [];

    return (
        <div className="container-fluid">
            <div className="row">
                <TeamMembers
                    team={team}
                    teams={teams}
                    user={user}
                    teamMembers={teamMembers}
                    setTeamMembers={setTeamMembers}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />
            </div>
            <div className="row">
                <ProjectsManaged
                    updateCount={updateCount}
                    setUpdateCount={setUpdateCount}
                    user={user}
                    projects={JSON.parse(projects)}
                    setProject={setProject}
                    is_leader={1}
                    is_team_leader={is_team_leader}
                    projectlead={projectlead}
                    setProjectlead={setProjectlead}
                    view={view}
                    setView={setView}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />

                <ProjectsOther
                    updateCount={updateCount}
                    setUpdateCount={setUpdateCount}
                    user={user}
                    projects={projects_not_members}
                    setProject={setProject}
                    is_leader={0}
                    is_team_leader={is_team_leader}
                    projectlead={projectlead}
                    setProjectlead={setProjectlead}
                    view={view}
                    setView={setView}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />
            </div>
            <div className="row">
                {(is_team_leader && <NewProjectForm
                        updateCount={updateCount}
                        setUpdateCount={setUpdateCount}
                        user={user}
                        team={team}
                        teamMembers={teamMembers}
                        waiting={waiting}
                        setWaiting={setWaiting}
                />)}
                {(is_team_leader && <DeleteTeam
                    user={user}
                    team={team}
                    setTeams={setTeams}
                    setView={setView}
                    setTeam={setTeam}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />)}
            </div>
        </div>
    );
}

const DeleteTeam = ({user, team, setTeams, setView, setTeam, waiting, setWaiting}) => {
    return (
        <div className="col-xl-6 col-lg-7">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                        Delete Team
                    </h6>
                </div>
                <div className="card-body">
                    <p>Delete this team.</p>
                    <p>WARNING: you cannot undo this operation.</p>
                    <br />
                    <TeamDeleteButton
                        user={user}
                        team={team}
                        setTeams={setTeams}
                        setTeam={setTeam}
                        setView={setView}
                        waiting={waiting}
                        setWaiting={setWaiting}
                    />
                </div>
            </div>
        </div>
    )
}

// Component for an individual team button
class TeamDeleteButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        if (this.props.waiting) {return}
        this.props.setWaiting(1);

        fetch('https://54.200.109.3:5001/delete_team',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user:this.props.user, team: {id:this.props.team}})
        }).then(response => response.json())
        .then(data => {
            this.props.setWaiting(0);
            this.props.setTeams(data.express);
            this.props.setTeam(0);
            this.props.setView("Home");
        });
    }

    render () {
        return (
            <button onClick={this.handleClick} className="btn btn-danger btn-lg">
                Delete
            </button>
        )
    }
}

const ProjectsManaged = ({updateCount, setUpdateCount, user, projects, setProject,
    is_leader, is_team_leader, projectlead, setProjectlead, view, setView, waiting, setWaiting}) => {
    return (
        <div className="col-xl-6 col-lg-7">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                        My Managed Projects
                    </h6>
                </div>
                <div className="card-body">
                    {projects.length === 0 && <p>You are not leading any projects on this team.</p>}
                    {projects.length > 0 &&
                        <ProjectList
                            updateCount={updateCount}
                            setUpdateCount={setUpdateCount}
                            user={user}
                            projects={projects}
                            setProject={setProject}
                            is_leader={1}
                            is_team_leader={is_team_leader}
                            projectlead={projectlead}
                            setProjectlead={setProjectlead}
                            view={view}
                            setView={setView}
                            waiting={waiting}
                            setWaiting={setWaiting}
                        />
                    }
                </div>
            </div>
        </div>
    )
}

const ProjectsOther = ({updateCount, setUpdateCount, user, projects, setProject, is_leader,
    is_team_leader, projectlead, setProjectlead, view, setView, waiting, setWaiting}) => {
    return (
        <div className="col-xl-6 col-lg-7">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                        Other Projects
                    </h6>
                </div>
                <div className="card-body">
                    {projects.length === 0 && <p>You are not on any projects on this team.</p>}
                    {projects.length > 0 &&
                        <ProjectList
                            updateCount={updateCount}
                            setUpdateCount={setUpdateCount}
                            user={user}
                            projects={projects}
                            setProject={setProject}
                            is_leader={0}
                            is_team_leader={is_team_leader}
                            projectlead={projectlead}
                            setProjectlead={setProjectlead}
                            view={view}
                            setView={setView}
                            waiting={waiting}
                            setWaiting={setWaiting}
                        />
                    }
                </div>
            </div>
        </div>
    )
}

class NewProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {projectname:'New Project',projectlead:0};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLeadChange = this.handleLeadChange.bind(this);
    }

    handleChange(event) {
        this.setState({projectname: event.target.value});
    }

    handleLeadChange(event) {
        this.setState({projectlead: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        if (this.props.waiting) {return}
        this.props.setWaiting(1);

        const lead_id = JSON.parse(this.props.teamMembers)[this.state.projectlead].id

        fetch('https://54.200.109.3:5001/new_project',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user:this.props.user, lead:lead_id, team:this.props.team, projectname: this.state.projectname})
        }).then((res) => {
            this.props.setUpdateCount(this.props.updateCount+1);
            this.props.setWaiting(0);
        })
    }

    render () {
        if (JSON.parse(this.props.teamMembers).length && !this.state.projectlead) {
            //this.setState({projectlead: 0});
        }
        return (
            <div className="col-xl-6 col-lg-7">
                <div className="card shadow mb-4">
                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 className="m-0 font-weight-bold text-primary">
                            Create New Project
                        </h6>
                    </div>
                    <div className="card-body">
                        <form onSubmit={this.handleSubmit}>
                            <label>Create a new project:</label>
                            <br />
                            <input type="text" defaultValue={this.state.projectname} onChange={this.handleChange} />
                            <br /><br />
                            Project lead:
                            <br />
                            <select onChange={this.handleLeadChange}>
                                {JSON.parse(this.props.teamMembers).map((x,i) => <option key={i} value={i}>{x.name}</option>)}
                            </select>
                            <br /><br />
                            <input type="submit" value="Create Project" className="btn btn-success" />
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

// Component to render a list of projects
const ProjectList = ({updateCount, setUpdateCount, user, projects, setProject,
    is_leader, is_team_leader, projectlead, setProjectlead, view, setView, waiting, setWaiting}) => {
    return (
        <>
            {projects.map((project)=> {
                return <ProjectSelector
                    updateCount={updateCount}
                    setUpdateCount={setUpdateCount}
                    user={user}
                    project={project}
                    key={project.id}
                    setProject={setProject}
                    is_leader={is_leader}
                    is_team_leader={is_team_leader}
                    projectlead={projectlead}
                    setProjectlead={setProjectlead}
                    view={view}
                    setView={setView}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />
            })}
        </>
    )
}

const ProjectSelector = ({updateCount, setUpdateCount, user, project, setProject,
    is_leader, is_team_leader, projectlead, setProjectlead, view, setView, waiting, setWaiting}) => {
    return (
        <ProjectButton
            project={project}
            key={project.id}
            setProject={setProject}
            projectlead={projectlead}
            setProjectlead={setProjectlead}
            view={view}
            setView={setView}
            waiting={waiting}
            setWaiting={setWaiting}
        />
    )
}

// Component for an individual team button
const ProjectButton = ({project, setProject, projectlead, setProjectlead, view, setView, waiting, setWaiting}) => {
    const handleClick = () => {
        if (waiting) {return}
        setProject(project.id)
        setProjectlead(project.leader);
        setView("Project");
    }
    return (
        <button
            onClick={handleClick}
            className="btn btn-primary btn-lg"
            style={{"marginRight":"40px", "marginBottom":"40px"}}
        >
            {project.name}
        </button>
    )
}

export default Projects;
