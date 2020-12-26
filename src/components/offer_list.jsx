import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import OfferCard from "./offer_card";
import Pagination from "./pagination";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import axios from "axios";

// Dark theme
const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

export default function OfferList({ token, setToken }) {
  // States
  const [paginationParams, setPaginationParams] = React.useState({
    page: 1,
    perPage: 3,
  });
  const [paginationLimits, setPaginationLimits] = React.useState({
    totalPages: 1,
    nextIsNull: true,
    prevIsNull: true,
  });
  const [offers, setOffers] = React.useState([]);
  const [filter, setFilter] = React.useState({
    deposit: true,
    loan: true,
    above50k: false,
  });

  // Gets offers from backend using pagination variables
  const getOffers = () => {
    axios
      .get(
        `/api/offers?page=${paginationParams.page}&per_page=${paginationParams.perPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.status === 401) {
          setToken(undefined);
          localStorage.setItem("token", undefined);
        } else if (response.status === 200) {
          setOffers(response.data.items);
          setPaginationLimits({
            totalPages: response.data._meta.total_pages,
            prevIsNull: response.data._links.prev === null,
            nextIsNull: response.data._links.next === null,
          });
        }
      })
      .catch((error) => {
        setToken(undefined);
        localStorage.setItem("token", undefined);
      });
  };

  // eslint-disable-next-line
  React.useEffect(getOffers, [paginationParams]);

  const handleFilterChange = (event) => {
    setFilter({ ...filter, [event.target.name]: event.target.checked });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Grid container item xs={6} direction="column">
        <Pagination
          limits={paginationLimits}
          params={paginationParams}
          setParams={setPaginationParams}
        />
        <Grid container direction="row">
          <FormControlLabel
            control={
              <Checkbox
                checked={filter.deposit}
                onChange={handleFilterChange}
                name="deposit"
              />
            }
            label="Deposit"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filter.loan}
                onChange={handleFilterChange}
                name="loan"
              />
            }
            label="Loan"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filter.above50k}
                onChange={handleFilterChange}
                name="above50k"
              />
            }
            label="Above 50 000 (excluding 50k)"
          />
        </Grid>
        {offers.map(
          (offer, index) =>
            filter[offer.transaction_type] &&
            ((filter.above50k && offer.amount > 50000) || !filter.above50k) && (
              <Grid key={index} style={{ marginBottom: 10 }} item>
                <OfferCard
                  id={`${paginationParams.page}.${paginationParams.perPage}.${index}`}
                  offer={offer}
                ></OfferCard>
              </Grid>
            )
        )}
        <Pagination
          limits={paginationLimits}
          params={paginationParams}
          setParams={setPaginationParams}
        />
      </Grid>
    </ThemeProvider>
  );
}
