import React from "react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { useHistory } from "react-router-dom";

export default function OfferCard(props) {
  let history = useHistory();
  const [isElevated, setIsElevated] = React.useState(false);
  const [elevation, setElevation] = React.useState(0);
  return (
    <Card
      onMouseOver={() => {
        setIsElevated(true);
        setElevation(10);
      }}
      onMouseOut={() => {
        setIsElevated(false);
        setElevation(0);
      }}
      raised={isElevated}
      elevation={elevation}
    >
      {/* BASIC DETAILS */}
      <CardActionArea onClick={() => history.push(`offers/${props.id}`)}>
        <CardContent>
          <Typography>Type: {props.offer.transaction_type}</Typography>
          <Typography>Amount: {props.offer.amount}</Typography>
          <Typography>Interest: {props.offer.interest}</Typography>
          <Typography>Timestamp: {props.offer.offer_timestamp}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
