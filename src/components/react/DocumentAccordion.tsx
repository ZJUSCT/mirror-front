import { useId, type ReactNode } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';

import MuiThemeProvider from './MuiThemeProvider';

interface DocumentAccordionProps {
  title: string;
  children: ReactNode;
}

function DocumentAccordionContent({ title, children }: DocumentAccordionProps) {
  const id = useId();
  const summaryId = `${id}-summary`;
  const detailsId = `${id}-details`;

  return (
    <Accordion
      defaultExpanded={false}
      disableGutters
      elevation={0}
      slots={{ heading: 'h2' }}
      sx={{
        my: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 'var(--radius) !important',
        bgcolor: 'background.paper',
        '&::before': { display: 'none' },
        '&.Mui-expanded:first-of-type': { mt: 2 },
        '&.Mui-expanded:last-of-type': { mb: 2 },
        '& > .MuiAccordion-heading': {
          m: 0,
          fontFamily: 'inherit',
          lineHeight: 'inherit',
        },
      }}
    >
      <AccordionSummary
        id={summaryId}
        aria-controls={detailsId}
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 2,
          minHeight: 56,
          '&.Mui-expanded': { minHeight: 56 },
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            my: 1.5,
          },
          '& .MuiAccordionSummary-content.Mui-expanded': { my: 1.5 },
        }}
      >
        <HelpIcon
          fontSize="small"
          sx={{ mr: 1.25, flex: '0 0 auto', color: 'text.primary' }}
        />
        <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        id={detailsId}
        aria-labelledby={summaryId}
        sx={{
          px: 2,
          pt: 1.5,
          pb: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          '& > astro-slot > :first-child': { mt: 0 },
          '& > astro-slot > :last-child': { mb: 0 },
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

export default function DocumentAccordion(props: DocumentAccordionProps) {
  return (
    <MuiThemeProvider>
      <DocumentAccordionContent {...props} />
    </MuiThemeProvider>
  );
}
