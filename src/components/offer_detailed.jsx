import React from "react";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Typography } from "@material-ui/core";

// Dark theme
const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

export default function OfferDetailed({ token, setToken }) {
  // id of item = a.b.c where
  // a page number
  // b per page
  // c index
  let { id } = useParams();

  // States
  const [offer, setOffer] = React.useState({});

  // Split id by . and get offer data
  React.useEffect(() => {
    let vars = id.split(".");
    axios
      .get(`/api/offers?page=${vars[0]}&per_page=${vars[1]}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.status === 401) {
          setToken(undefined);
          localStorage.setItem("token", undefined);
        } else if (response.status === 200) {
          setOffer(response.data.items[vars[2]]);
        }
      })
      .catch((error) => {
        setToken(undefined);
        localStorage.setItem("token", undefined);
      });
  }, [id, setOffer, setToken, token]);

  return (
    <ThemeProvider theme={darkTheme}>
      {/* Map all keys and show fields of offer */}
      {Object.keys(offer).map((key) => (
        <Typography>{key + ": " + offer[key]}</Typography>
      ))}
    </ThemeProvider>
  );
}
