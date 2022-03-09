import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Button, Collapse } from "@mui/material/";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { IsoDict } from "../types/mirror";
import Iso from "./iso";
export interface IsoListProps {
  isoDict: IsoDict;
}

export default function IsoList({ isoDict }: IsoListProps) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState<boolean>(false);

  return (
    <Box display="flex" flexDirection="column" alignContent="center">
      <Box display="flex" gap="8px" flexWrap="wrap">
        {
          Object.entries(isoDict)
            .map(([name, url], i) => (
              <Collapse
                unmountOnExit
                in={i < 4 || showAll}
                sx={{ width: { xs: '100%', md: 'calc(50% - 4px)' } }}
              >
                <Iso name={name} url={url} />
              </Collapse>
            ))
        }
      </Box>
      {
        Object.entries(isoDict).length > 4 && (
          <Button
            sx={{ mt: 1 }}
            variant="text"
            onClick={() => setShowAll(!showAll)}
            startIcon={showAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          >
            {showAll ? t("折叠") : t("展开")}
          </Button>
        )
      }
    </Box>
  );
}
