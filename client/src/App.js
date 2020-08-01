import React, {Component} from 'react';

// New - import the React Router components, and the Profile page component
import { Router, Route, Switch } from "react-router-dom";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import history from "./utils/history";

// NEW - import the PrivateRoute component
import PrivateRoute from "./components/PrivateRoute";

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
        const response = await fetch('https://54.200.109.3:5001/users');
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
