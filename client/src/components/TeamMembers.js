// src/components/TeamMembers.js
// Component that allows the team leader to manage team members.

import React, { Fragment, useState, useEffect } from "react";

const TeamMembers = ({team, teams, user, teamMembers, setTeamMembers, waiting, setWaiting}) => {
    const [updateCount, setUpdateCount] = useState(0);

    useEffect(()=> {
        async function getMembers() {
            const response = await fetch('/team_members',{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({"team":team})
            });
            const my_members = await response.json();

            setTeamMembers(my_members.express);
        }
        getMembers();
    },[user, team, teams, updateCount, setTeamMembers]);

    // Determine if the user is the leader of the current team
    let is_leader = 0;
    for (let i=0; i<JSON.parse(teams).length; i++) {
        if (JSON.parse(teams)[i].id === team) {
            is_leader = 1;
        }
    }

    let members = JSON.parse(teamMembers).sort((x,y)=>{
        if (x.email === user.email && y.email !== user.email) {return -1}
        if (y.email === user.email && x.email !== user.email) {return 1}
        return (y.id > x.id ? 1 : -1)
    });

    return (
        <Fragment>
            <div className="col-xl-6 col-lg-7">
                <div className="card shadow mb-4">
                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 className="m-0 font-weight-bold text-primary">
                            Team Members
                        </h6>
                    </div>
                    <div className="card-body">
                        {members.map((x,i)=>
                            <Fragment key={x.id}>
                                <TeamMember
                                    key={x.id}
                                    member={x}
                                    user={user}
                                    team={team}
                                    updateCount={updateCount}
                                    setUpdateCount={setUpdateCount}
                                    is_leader={is_leader}
                                    waiting={waiting}
                                    setWaiting={setWaiting}
                                />
                                {(i < members.length-1) &&
                                    <Fragment>
                                        <br />
                                        <br />
                                        <hr className="sidebar-divider my-0" />
                                        <br />
                                    </Fragment>
                                }
                            </Fragment>
                        )}
                    </div>
                </div>
            </div>
            {is_leader ? <AddTeamMember
                user={user}
                team={team}
                updateCount={updateCount}
                setUpdateCount={setUpdateCount}
                waiting={waiting}
                setWaiting={setWaiting}
                teamMembers={teamMembers}
            /> :
                <Fragment></Fragment>
            }
        </Fragment>
    )
}

const AddTeamMember = ({user, team, updateCount, setUpdateCount, waiting, setWaiting, teamMembers}) => {
    return (
        <div className="col-xl-6 col-lg-7">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                        Add Team Member
                    </h6>
                </div>

                <div className="card-body">
                    <AddMemberToTeam
                        user={user}
                        team={team}
                        updateCount={updateCount}
                        setUpdateCount={setUpdateCount}
                        waiting={waiting}
                        setWaiting={setWaiting}
                        teamMembers={teamMembers}
                    />
                    <br />
                    <br />
                    <AddMemberToTeamEmail
                        user={user}
                        team={team}
                        updateCount={updateCount}
                        setUpdateCount={setUpdateCount}
                        waiting={waiting}
                        setWaiting={setWaiting}
                        teamMembers={teamMembers}
                    />
                </div>
            </div>
        </div>
    )
}


class AddMemberToTeamEmail extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {memberemail:'Email',message:"", messageStatus:"Failure"};
    }

    handleChange(event) {
        this.setState({memberemail: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.props.waiting) {return}
        this.props.setWaiting(1);

        fetch('/add_member_email',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user:this.props.user, team:this.props.team, memberemail: this.state.memberemail})
        }).then(response=>response.json()).then(data => {
            if (data.express === "No such member found.") {
                this.setState({message: "No user with email "+this.state.memberemail + " found."});
                this.setState({messageStatus: "Failure"});
            }
            else {
                this.setState({message: "The user with email " + this.state.memberemail + " added to the team."});
                this.setState({messageStatus: "Success"});
            }
            for (let i = 0; i<JSON.parse(this.props.teamMembers).length; i++) {
                if (this.state.memberemail === JSON.parse(this.props.teamMembers)[i].email) {
                    this.setState({message: "The user with email" + this.state.memberemail + " is already on the team."});
                    this.setState({messageStatus: "Failure"});
                }
            }
            this.props.setUpdateCount(this.props.updateCount+1);
            this.props.setWaiting(0);
        })
    }

    render () {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>Add member to team, by email: </label>
                <br />
                <input type="text" defaultValue={this.state.memberemail} onChange={this.handleChange} />
                <br /><br />
                <input type="submit" value="Add Member" className="btn btn-success" />
                {this.state.message.length > 0 ?
                    <p style={{"color":this.state.messageStatus==="Failure"?"#AA0000":"#00AA00"}}>{this.state.message}</p> :
                    <Fragment />
                }
            </form>
        )
    }
}

class AddMemberToTeam extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {membername:'Name', message:"", messageStatus:"Success"};
    }

    handleChange(event) {
        this.setState({membername: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.props.waiting) {return}
        this.props.setWaiting(1);

        fetch('/add_member',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user:this.props.user, team:this.props.team, membername: this.state.membername})
        }).then(response=>response.json()).then(data => {
            if (data.express === "No such member found.") {
                this.setState({message: "No user "+this.state.membername + " found."});
                this.setState({messageStatus: "Failure"});
            }
            else {
                this.setState({message: this.state.membername + " added to the team."});
                this.setState({messageStatus: "Success"});
            }
            for (let i = 0; i<JSON.parse(this.props.teamMembers).length; i++) {
                if (this.state.membername === JSON.parse(this.props.teamMembers)[i].name) {
                    this.setState({message: this.state.membername + " is already on the team."});
                    this.setState({messageStatus: "Failure"});
                }
            }
            this.props.setUpdateCount(this.props.updateCount+1);
            this.props.setWaiting(0);
        })
    }

    render () {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>Add member to team, by name: </label>
                <br />
                <input type="text" defaultValue={this.state.membername} onChange={this.handleChange} />
                <br /><br />
                <input type="submit" value="Add Member" className="btn btn-success" />
                {this.state.message.length > 0 ?
                    <p style={{"color":this.state.messageStatus==="Failure"?"#AA0000":"#00AA00"}}>{this.state.message}</p> :
                    <Fragment />
                }
            </form>
        )
    }
}

const TeamMember = ({member, user, team, updateCount, setUpdateCount, is_leader}) => {
    return (
        <Fragment>
            <b>
                Name:&nbsp;&nbsp;&nbsp;&nbsp;
            </b>
            {member.name}
            <br />
            <b>
                Email:&nbsp;&nbsp;&nbsp;&nbsp;
            </b>
            {member.email}
            <br />
            {user.email === member.email ?
                <Fragment><b>Team Leader</b></Fragment> :
                (is_leader) && <MemberRemoveButton member={member} team={team} updateCount={updateCount} setUpdateCount={setUpdateCount}/>
            }
        </Fragment>
    )
}

class MemberRemoveButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        fetch('/remove_member',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({member:this.props.member.id, team: this.props.team})
        }).then(data => {
            this.props.setUpdateCount(this.props.updateCount+1);
        });
    }

    render () {
        return (
            <button onClick={this.handleClick} className="btn btn-danger">
                Remove From Team
            </button>
        )
    }
}

export default TeamMembers;
