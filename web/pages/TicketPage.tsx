import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Link,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {Link as RouterLink, useParams} from 'react-router';
import {STATUS_LABELS, TICKET_STATUSES, type ActivityDto, type TicketStatus} from '../../src/tickets/ticket-dto';
import {trackerApi} from '../api/tracker-api';
import {actorName, describeActivity, timeAgo} from '../tickets/describe-activity';
import {Markdown} from '../tickets/Markdown';
import {TypeChip} from '../tickets/TicketChips';
import {ticketKeys, useChangeStatus, useTicket} from '../tickets/ticket-queries';

export function TicketPage() {
  const {key = ''} = useParams();
  const ticket = useTicket(key);
  const changeStatus = useChangeStatus();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const addComment = useMutation({
    mutationFn: () => trackerApi.addCommentAsync(key, comment),
    onSuccess: async () => {
      setComment('');
      await queryClient.invalidateQueries({queryKey: ticketKeys.all});
    },
  });

  if (ticket.isLoading) {
    return <Skeleton variant="rounded" height={400} />;
  }
  if (!ticket.data) {
    return <Alert severity="error">{ticket.error?.message ?? `There is no ticket ${key}.`}</Alert>;
  }
  const data = ticket.data;

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'minmax(0, 2fr) minmax(280px, 1fr)'}, gap: 3}}>
      <Box>
        <Breadcrumbs sx={{mb: 1}}>
          <Link component={RouterLink} to="/board" underline="hover" color="text.secondary">
            Board
          </Link>
          <Typography color="text.primary">{data.key}</Typography>
        </Breadcrumbs>
        <Stack direction="row" sx={{alignItems: 'center', gap: 1}}>
          <Typography variant="body2" color="primary" sx={{fontWeight: 700}}>
            {data.key}
          </Typography>
          <TypeChip type={data.type} />
        </Stack>
        <Typography variant="h5" component="h1" sx={{mt: 0.5, mb: 2}} data-testid="ticket-heading">
          {data.title}
        </Typography>
        <Paper sx={{p: 3}}>
          {data.description ? (
            <Markdown>{data.description}</Markdown>
          ) : (
            <Typography color="text.secondary">No description.</Typography>
          )}
        </Paper>
      </Box>

      <Stack sx={{gap: 2}}>
        <TextField
          select
          label="Status"
          value={data.status}
          onChange={(event) => changeStatus.mutate({key: data.key, status: event.target.value as TicketStatus})}
          disabled={changeStatus.isPending}
          data-testid="ticket-status"
        >
          {TICKET_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </MenuItem>
          ))}
        </TextField>
        {changeStatus.error && <Alert severity="error">{changeStatus.error.message}</Alert>}

        <Paper sx={{p: 2}}>
          <Typography variant="subtitle2" sx={{mb: 1.5}}>
            Activity
          </Typography>
          <Stack sx={{gap: 1.5, borderLeft: 2, borderColor: 'divider', pl: 1.5}} data-testid="ticket-activity">
            {data.activity.map((activity) => (
              <ActivityEntry key={activity.id} activity={activity} />
            ))}
          </Stack>
        </Paper>

        <Stack sx={{gap: 1}}>
          <TextField
            label="Comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            multiline
            minRows={2}
            data-testid="comment-input"
          />
          {addComment.error && <Alert severity="error">{addComment.error.message}</Alert>}
          <Box>
            <Button
              variant="outlined"
              onClick={() => addComment.mutate()}
              disabled={comment.trim() === '' || addComment.isPending}
              data-testid="comment-submit"
            >
              Comment
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

function ActivityEntry({activity}: {activity: ActivityDto}) {
  return (
    <Box>
      {activity.kind === 'created' ? (
        <Typography variant="body2">Created</Typography>
      ) : (
        <Typography variant="body2">
          <Box
            component="span"
            sx={{fontWeight: 700, color: activity.actor === 'agent' ? 'secondary.main' : 'text.primary'}}
          >
            {actorName(activity)}
          </Box>{' '}
          {describeActivity(activity)}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" title={new Date(activity.at).toLocaleString('en-GB')}>
        {timeAgo(activity.at)}
      </Typography>
      {activity.comment && (
        <Paper variant="outlined" sx={{p: 1.5, mt: 0.5, bgcolor: 'background.default'}}>
          <Markdown>{activity.comment}</Markdown>
        </Paper>
      )}
    </Box>
  );
}
