import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Login from "./components/login";
import OfferDetailed from "./components/offer_detailed";
import OfferList from "./components/offer_list";

function App() {
  // localStorage is not safe but this task is not about safety
  const [token, setToken] = React.useState(localStorage.getItem("token"));

  // React.useEffect(setToken(localStorage.getItem("token")), []);
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Switch>
            {/* DETAILED OFFER */}
            <Route
              exact
              path="/offers/:id"
              render={(props) =>
                token ? (
                  <OfferDetailed {...props} token={token} setToken={setToken} />
                ) : (
                  <Redirect to="/login" />
                )
              }
            />
            {/* OFFER LIST */}
            <Route
              exact
              path="/offers"
              render={(props) =>
                token ? (
                  <OfferList {...props} token={token} setToken={setToken} />
                ) : (
                  <Redirect to="/login" />
                )
              }
            />
            {/* LOGIN PAGE */}
            <Route
              path="/login"
              render={(props) => <Login {...props} setToken={setToken} />}
            />
            {/* INDEX GOES TO LOGIN */}
            <Route path="/" render={(props) => <Redirect to="/login" />} />
          </Switch>
        </Router>
      </header>
    </div>
  );
}

export default App;
