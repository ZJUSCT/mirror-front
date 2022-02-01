import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
} from "@mui/material";

export default ({
  promptString,
  versionList,
  configGen,
}: {
  promptString: string;
  versionList: string[];
  configGen: (version: string) => string;
}) => {
  const [version, setVersion] = useState(versionList[0]);
  return (
    <Box>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-end"
      >
        <Grid item sx={{ mb: 1 }}>
          {promptString}
        </Grid>
        <Grid item>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-helper-label">
              Version
            </InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              label="Age"
              onChange={event => {
                setVersion(event.target.value as string);
              }}
            >
              {versionList.map((item, i) => {
                return <MenuItem key={i} value={item}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <pre>
        <code>{configGen(version)}</code>
      </pre>
    </Box>
  );
};
