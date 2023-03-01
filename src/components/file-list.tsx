import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Button, Collapse } from '@mui/material/';
import natsort from 'natsort';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import File, { FileProps } from './file';

export interface FileListProps {
  files: FileProps[];
}

export default ({ files }: FileListProps) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState<boolean>(false);

  var sorter = natsort({desc: true});
  files.sort(function (a, b) {
    return sorter(a.name, b.name);
  });

  return (
    <Box display="flex" flexDirection="column" alignContent="center">
      <Box display="flex" gap="8px" flexWrap="wrap">
        {files.map(({ name, url }, i) => (
          <Collapse
            unmountOnExit
            in={i < 4 || showAll}
            sx={{ width: { xs: '100%', md: 'calc(50% - 4px)' } }}
          >
            <File name={name} url={url} />
          </Collapse>
        ))}
      </Box>
      {files.length > 4 && (
        <Button
          sx={{ mt: 1 }}
          variant="text"
          onClick={() => setShowAll(!showAll)}
          startIcon={
            showAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
          }
        >
          {showAll ? t('折叠') : t('展开')}
        </Button>
      )}
    </Box>
  );
};
