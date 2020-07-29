// src/components/HomeView.js
// The main panel for the home screen

import React from "react";

const HomeView = ({user, teams, setTeams, waiting, setWaiting}) => {
    if (!user) {
        return (
            <p>Not logged in.</p>
        )
    }
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-xl-6 col-lg-7">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">
                                About Me
                            </h6>
                        </div>
                        <div className="card-body">
                            <p><b>Name: </b>{user.name}</p>
                            <p><b>Email: </b>{user.email}</p>
                            <img src={user.picture} alt="Profile" style={{"height":"100px"}} />
                        </div>
                    </div>
                </div>
                <div className="col-xl-6 col-lg-7">
                    <NewTeamForm user={user} setTeams={setTeams} waiting={waiting} setWaiting={setWaiting}/>
                </div>
            </div>
        </div>
    )
}

class NewTeamForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {teamname:'New Team'};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({teamname: event.target.value});
    }

    handleSubmit(event) {
        //alert('A name was submitted: ' + this.state.value);
        event.preventDefault();

        if (this.props.waiting) {return}
        this.props.setWaiting(1);

        fetch('/new_team',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user:this.props.user, teamname: this.state.teamname})
        }).then(response => response.json())
        .then(data=>{
            this.props.setWaiting(0);
            this.props.setTeams(data.express)
        });
    }

    render () {
        return (
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">
                        New Team
                    </h6>
                </div>
                <div className="card-body">
                    <form onSubmit={this.handleSubmit}>
                        <p><label>Create a new team:</label></p>
                        <input type="text" defaultValue={this.state.teamname} onChange={this.handleChange} />
                        <br />
                        <br />
                        <input className="btn btn-success btn-lg" type="submit" value="Create Team" />
                    </form>
                </div>
            </div>
        )
    }
}

export default HomeView;
