import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { TextField } from "@material-ui/core";

// Dark theme
const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

export default function Pagination(props) {
  // Do not let page count be more than max
  const handlePaginationChange = (name) => (event) => {
    let value = event.target.value;
    if (name === "page" && value > props.limits.totalPages)
      value = props.limits.totalPages;
    else if (name === "page" && value < 1) value = 1;
    props.setParams({ ...props.params, [name]: value });
  };
  return (
    <ThemeProvider theme={darkTheme}>
      <Grid container direction="row" spacing={5}>
        <Grid item xs={3}>
          {/* PREV PAGE */}
          <Button
            onClick={() =>
              props.setParams({ ...props.params, page: props.params.page - 1 })
            }
            disabled={props.limits.prevIsNull}
            variant="outlined"
          >
            {"<"}
          </Button>
        </Grid>
        <Grid item xs={3}>
          {/* CURRENT PAGE */}
          <TextField
            margin="dense"
            variant="outlined"
            label="Page #"
            value={props.params.page}
            type="number"
            // InputProps={{
            //   inputProps: { min: 1, max: props.limits.totalPages },
            // }}
            onChange={handlePaginationChange("page")}
          ></TextField>
        </Grid>
        <Grid item xs={3}>
          {/* PER PAGE */}
          <TextField
            margin="dense"
            variant="outlined"
            type="number"
            label="Per Page"
            value={props.params.perPage}
            onChange={handlePaginationChange("perPage")}
          ></TextField>
        </Grid>
        <Grid item xs={3}>
          {/* NEXT PAGE */}
          <Button
            onClick={() =>
              props.setParams({ ...props.params, page: props.params.page + 1 })
            }
            disabled={props.limits.nextIsNull}
            variant="outlined"
          >
            {">"}
          </Button>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
