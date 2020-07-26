// src/components/Issues.js
// Component that displays list of issues for a given project

import React, { Fragment, Component, useState, useEffect } from "react";
import { useAuth0 } from "../react-auth0-spa";

const Issues = ({project, projectlead, teamMembers, projectsMembership,
    updateCountProject, setUpdateCountProject, setProject, setView, is_team_leader, waiting, setWaiting}) => {
    const { loading, user } = useAuth0();
    const [issues, setIssues] = useState(0);
    const [userID, setUserID] = useState(0);
    const [updateCount, setUpdateCount] = useState(0);

    useEffect(()=> {
        setWaiting(1);
        async function getIssues() {
            const response = await fetch('/issues',{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({user:user, project:project})
            });
            const my_issues = await response.json();
            setIssues(my_issues.express);
            setWaiting(0);
        }
        getIssues();
    },[user, project, updateCount])

    useEffect(() => {
        setWaiting(1);
        async function getUserID() {
            const response = await fetch('/get_id',{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({email:user.email})
            });
            const myID = await response.json();
            if (JSON.parse(myID.express).length > 0) {
                setUserID(JSON.parse(myID.express)[0].id);
            }
            setWaiting(0);
        }
        getUserID();
    },[user])

    const issues_array = issues ? JSON.parse(issues) : [];

    // Sort team members by ID
    let members_by_id = {}
    for (let i=0; i<JSON.parse(teamMembers).length; i++) {
        members_by_id[JSON.parse(teamMembers)[i].id] = JSON.parse(teamMembers)[i]
    }

    // Current project name
    let project_name = "";
    if (project && projectsMembership) {
        let filtered = JSON.parse(projectsMembership).filter((x)=>x.id===project);
        if (filtered.length) {
            project_name = JSON.parse(projectsMembership).filter((x)=>x.id===project)[0].name
        }
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <IssueList
                    list_name={"My Open Issues"}
                    issues_array={issues_array}
                    userID={userID}
                    user={user}
                    members_by_id={members_by_id}
                    projectlead={projectlead}
                    updateCount={updateCount}
                    setUpdateCount={setUpdateCount}
                    by_owner={true}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />
                <IssueList
                    list_name={"Other Open Issues"}
                    issues_array={issues_array}
                    userID={userID}
                    user={user}
                    members_by_id={members_by_id}
                    projectlead={projectlead}
                    updateCount={updateCount}
                    setUpdateCount={setUpdateCount}
                    by_owner={false}
                    waiting={waiting}
                    setWaiting={setWaiting}
                />
            </div>
            <div className="row">
                {userID === projectlead ?
                    <NewIssueForm
                        user={userID}
                        project={project}
                        teamMembers={teamMembers}
                        updateCount={updateCount}
                        setUpdateCount={setUpdateCount}
                        waiting={waiting}
                        setWaiting={setWaiting}
                    /> :
                    <Fragment></Fragment>
                }
                {is_team_leader ?
                    <DeleteProject
                        updateCountProject={updateCountProject}
                        setUpdateCountProject={setUpdateCountProject}
                        user={user}
                        project={project}
                        setProject={setProject}
                        setView={setView}
                        waiting={waiting}
                        setWaiting={setWaiting}
                    /> :
                    <Fragment></Fragment>
                }
            </div>
        </div>
    )
}

const DeleteProject = ({updateCountProject, setUpdateCountProject, user, project, setProject, setView,
    waiting, setWaiting}) => {
    return (
        <div className="col-xl-6 col-lg-5">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                        Delete Project
                    </h6>
                </div>
                <div className="card-body">
                    <p>Delete this project.</p>
                    <p>WARNING: this operation cannot be undone.</p>
                    <ProjectDeleteButton
                        updateCountProject={updateCountProject}
                        setUpdateCountProject={setUpdateCountProject}
                        user={user}
                        project={project}
                        setProject={setProject}
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
class ProjectDeleteButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        if (this.props.waiting) {return}
        this.props.setWaiting(1);

        fetch('/delete_project',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user:this.props.user, project: {id:this.props.project}})
        }).then(response => response.json())
        .then(data => {
            this.props.setWaiting(0);
            this.props.setUpdateCountProject(this.props.updateCountProject+1)
            this.props.setProject(0);
            this.props.setView("Team");
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

const IssueList = ({list_name, issues_array, userID, user, members_by_id,
        projectlead, updateCount, setUpdateCount, by_owner, waiting, setWaiting}) => {
    let filtered_issues = issues_array.filter((issue) => (by_owner ? (issue.owner === userID):(issue.owner !== userID)))

    return (
        <div className="col-xl-6 col-lg-5">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                        {list_name}
                    </h6>
                </div>
                <div className="card-body">
                    {filtered_issues.map((issue,i)=>
                        <Fragment key={issue.id}>
                            <Issue
                                    key={issue.id}
                                    issue={issue}
                                    userID={userID}
                                    user={user}
                                    members_by_id={members_by_id}
                                    projectlead={projectlead}
                                    updateCount={updateCount}
                                    setUpdateCount={setUpdateCount}
                                    waiting={waiting}
                                    setWaiting={setWaiting}
                            />
                            {(i<filtered_issues.length-1) ?
                                <Fragment>
                                    <hr className="sidebar-divider my-0"/>
                                    <br />
                                </Fragment> :
                                <Fragment></Fragment>
                            }
                        </Fragment>
                    )}
                </div>
            </div>
        </div>
    )
}

class Issue extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        if (this.props.waiting) {return}
        this.props.setWaiting(1);

        fetch('/close_issue',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user:this.props.user, issue: this.props.issue.id})
        }).then((res) => {
            this.props.setWaiting(0);
            this.props.setUpdateCount(this.props.updateCount+1)
        })
    }

    render() {
        return (
            <div>
                <div style={{"float":"left"}}>
                    {this.props.issue.owner !== this.props.userID &&
                        <p>
                            <b>Owner: {this.props.members_by_id[this.props.issue.owner].name}</b>
                        </p>
                    }
                    <p>{this.props.issue.description}</p>
                </div>
                <div style={{"float":"right"}}>
                    {this.props.issue.owner === this.props.userID &&
                        <Fragment>
                            <button onClick={this.handleClick} className="btn btn-primary">
                                Done
                            </button>
                            <br /><br />
                        </Fragment>
                    }
                    {this.props.userID === this.props.projectlead &&
                        <Fragment>
                            <button onClick={this.handleClick} className="btn btn-warning">
                                Close
                            </button>
                            <br /><br />
                        </Fragment>
                    }
                </div>
                <div style={{"clear":"both"}} />
            </div>
        )
    }
}

class NewIssueForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {issuedesc:'New Issue',owner:0};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOwnerChange = this.handleOwnerChange.bind(this);
    }

    handleChange(event) {
        this.setState({issuedesc: event.target.value});
    }

    handleOwnerChange(event) {
        const owner_id = JSON.parse(this.props.teamMembers)[event.target.value].id
        this.setState({owner: owner_id});
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.props.waiting) {return}
        this.props.setWaiting(1);

        fetch('/new_issue',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user:this.props.user, lead:this.state.owner, project:this.props.project, issuedesc: this.state.issuedesc})
        }).then((res) => {
            this.props.setUpdateCount(this.props.updateCount+1);
            this.props.setWaiting(0);
        })
    }

    render () {
        if (JSON.parse(this.props.teamMembers).length && !this.state.owner) {
            this.state.owner = JSON.parse(this.props.teamMembers)[0].id;
        }
        return (
            <div className="col-xl-6 col-lg-5">
                <div className="card shadow mb-4">
                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 className="m-0 font-weight-bold text-primary">
                            New Issue
                        </h6>
                    </div>
                    <div className="card-body">
                        <form onSubmit={this.handleSubmit}>
                            <p><label>Open a new issue:</label></p>
                            <input type="text" defaultValue={this.state.issuedesc} onChange={this.handleChange} />
                            <br />
                            <p>Owner:</p>
                            <select onChange={this.handleOwnerChange}>
                                {JSON.parse(this.props.teamMembers).map((x,i) => <option key={i} value={i}>{x.name}</option>)}
                            </select>
                            <br /><br />
                            <input type="submit" value="Open Issue" className="btn btn-success" />
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default Issues;
