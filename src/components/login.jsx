import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import axios from "axios";

// Snackbar to show error message
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

// Dark theme
const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

// Styling for textfields
const useStyles = makeStyles((theme) => ({
  loginTextfield: { marginBottom: 10 },
}));

// Login component
export default function Login(props) {
  const classes = useStyles();

  // States
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [authObject, setAuthObject] = React.useState({
    username: "",
    password: "",
  });

  // Auth function, uses Basic Auth and gets bearer token
  // Opens snackbar upon error and resets localstorage
  // Saves token if success
  const auth = (event) => {
    event.preventDefault();
    axios
      .get("/api/login", {
        auth: authObject,
      })
      .then((response) => {
        console.log(response.status);
        if (response.status === 401 || response.status === 500) {
          setSnackbarOpen(true);
          localStorage.setItem("token", undefined);
        } else if (response.status === 200) {
          props.setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          props.history.push("/offers");
        }
      })
      .catch((error) => {
        setSnackbarOpen(true);
        localStorage.setItem("token", undefined);
      });
  };

  // Update Basic Auth Config object
  const handleAuthDataChange = (name) => (event) => {
    setAuthObject({ ...authObject, [name]: event.target.value });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <form style={{ width: "50%" }} onSubmit={auth}>
        <Grid
          className={classes.loginGrid}
          container
          item
          direction="column"
          spacing={10}
        >
          {/* LOGIN TEXTFIELD */}
          <TextField
            required
            className={classes.loginTextfield}
            label="Login"
            variant="outlined"
            onChange={handleAuthDataChange("username")}
          ></TextField>

          {/* PASSWORD TEXTFIELD */}
          <TextField
            required
            className={classes.loginTextfield}
            label="Password"
            type="password"
            variant="outlined"
            onChange={handleAuthDataChange("password")}
          ></TextField>

          {/* LOGIN BUTTON */}
          <Button type="submit" variant="contained">
            Login
          </Button>
        </Grid>

        {/* ERROR SNACKBAR */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="error">
            Could not verify details!
          </Alert>
        </Snackbar>
      </form>
    </ThemeProvider>
  );
}
