import React, {Component} from 'react';
import { useAuth0 } from "./react-auth0-spa";

// New - import the React Router components, and the Profile page component
import { Router, Route, Switch } from "react-router-dom";
import Profile from "./components/Profile";
import Teams from "./components/Teams";
import Dashboard from "./components/Dashboard";
import history from "./utils/history";

// NEW - import the PrivateRoute component
import PrivateRoute from "./components/PrivateRoute";

import logo from './logo.svg';
import './startbootstrap-sb-admin-2-gh-pages/css/sb-admin-2.min.css';

class App extends Component {
    state = {
        response: '',
        post: '',
        responseToPost: '',
    };

    componentDidMount() {
        this.callApi()
            .then(res => this.setState({ response: res.express }))
            .catch(err => console.log(err));
    }

    callApi = async () => {
        const response = await fetch('/users');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    render() {
        return (
            <div className="App">
                {/* Don't forget to include the history module */}
                <Router history={history}>
                    <Switch>
                        <PrivateRoute path="/profile" component={Profile} />
                        <Route path="/" component={Dashboard} />
                    </Switch>
                </Router>
            </div>
        );
    }
}

export default App;
