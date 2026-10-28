import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {useNavigate} from 'react-router';
import type {TicketType} from '../../src/tickets/ticket-dto';
import {trackerApi} from '../api/tracker-api';
import {ticketKeys} from './ticket-queries';

const EMPTY = {type: 'story' as TicketType, title: '', description: ''};

/** A new ticket goes to the bottom of the backlog, in To Do. */
export function TicketCreateDialog({open, onClose}: {open: boolean; onClose: () => void}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);

  const create = useMutation({
    mutationFn: () => trackerApi.createTicketAsync(form),
    onSuccess: async (ticket) => {
      await queryClient.invalidateQueries({queryKey: ticketKeys.all});
      setForm(EMPTY);
      onClose();
      navigate(`/tickets/${ticket.key}`);
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>New ticket</DialogTitle>
      <DialogContent>
        <Stack sx={{gap: 2, pt: 1}}>
          <Stack direction="row" sx={{gap: 2}}>
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={(event) => setForm({...form, type: event.target.value as TicketType})}
              sx={{width: 140}}
              data-testid="ticket-type"
            >
              <MenuItem value="story">Story</MenuItem>
              <MenuItem value="bug">Bug</MenuItem>
            </TextField>
            <TextField
              label="Title"
              value={form.title}
              onChange={(event) => setForm({...form, title: event.target.value})}
              required
              fullWidth
              autoFocus
              data-testid="ticket-title"
            />
          </Stack>
          <TextField
            label="Description"
            value={form.description}
            onChange={(event) => setForm({...form, description: event.target.value})}
            helperText="Markdown. Say what is wanted and how we will know it is done."
            multiline
            minRows={10}
            fullWidth
            slotProps={{htmlInput: {style: {fontFamily: 'ui-monospace, monospace', fontSize: 13}}}}
            data-testid="ticket-description"
          />
          {create.error && <Alert severity="error">{create.error.message}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => create.mutate()}
          disabled={form.title.trim() === '' || create.isPending}
          data-testid="create-ticket-submit"
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
