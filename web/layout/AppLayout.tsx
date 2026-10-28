import AddIcon from '@mui/icons-material/Add';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import {AppBar, Box, Button, Container, Tab, Tabs, Toolbar, Typography} from '@mui/material';
import {useState} from 'react';
import {Link as RouterLink, Outlet, useLocation} from 'react-router';
import {TicketCreateDialog} from '../tickets/TicketCreateDialog';

const MCP_URL = `${window.location.origin}/mcp`;

export function AppLayout() {
  const {pathname} = useLocation();
  const [creating, setCreating] = useState(false);
  const tab = pathname.startsWith('/backlog') ? '/backlog' : pathname.startsWith('/tickets') ? false : '/board';

  return (
    <Box sx={{minHeight: '100vh', bgcolor: 'background.default'}}>
      <AppBar position="sticky" color="inherit" sx={{borderBottom: 1, borderColor: 'divider'}}>
        <Toolbar sx={{gap: 2}}>
          <ViewKanbanIcon color="primary" />
          <Typography variant="h6" component="div">
            Acme Tracker
          </Typography>
          <Tabs value={tab} sx={{ml: 2, flexGrow: 1}}>
            <Tab label="Board" value="/board" component={RouterLink} to="/board" />
            <Tab label="Backlog" value="/backlog" component={RouterLink} to="/backlog" />
          </Tabs>
          <Typography variant="caption" color="text.secondary" sx={{display: {xs: 'none', md: 'block'}}}>
            MCP: {MCP_URL}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreating(true)}
            data-testid="new-ticket"
          >
            New ticket
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{py: 3}}>
        <Outlet />
      </Container>
      <TicketCreateDialog open={creating} onClose={() => setCreating(false)} />
    </Box>
  );
}
