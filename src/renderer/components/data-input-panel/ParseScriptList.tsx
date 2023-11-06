import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { PARSE_KEYS } from "../../../main/parse";

const ParseScriptList = () => {
  const [state, setState] = React.useState({
    gilad: true,
    jason: false,
    antoine: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };
  return (
    <FormGroup>
      <Stack direction="row" flexWrap="wrap">
        <FormControlLabel
          control={
            <Checkbox size="small" onChange={handleChange} name="gilad" />
          }
          label={
            <Typography variant="caption">
              {PARSE_KEYS.MONTHLY_GAINED_VIEWS.trigger}
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Checkbox size="small" onChange={handleChange} name="jason" />
          }
          label={
            <Typography variant="caption">
              {PARSE_KEYS.MONTHLY_GAINED_SUBSCRIBERS.trigger}
            </Typography>
          }
        />
      </Stack>
    </FormGroup>
  );
};

export default ParseScriptList;
