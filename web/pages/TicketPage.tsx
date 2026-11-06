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
  const comments = data.activity.filter(isComment);

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

        <Typography variant="subtitle1" component="h2" sx={{fontWeight: 600, mt: 4, mb: 1.5}}>
          Comments
        </Typography>
        <Stack sx={{gap: 2}} data-testid="ticket-comments">
          {comments.length === 0 && <Typography color="text.secondary">No comments yet.</Typography>}
          {comments.map((activity) => (
            <CommentEntry key={activity.id} ticketKey={data.key} activity={activity} />
          ))}
        </Stack>

        <Stack sx={{gap: 1, mt: 3}}>
          <TextField
            label="Add a comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            multiline
            minRows={3}
            data-testid="comment-input"
          />
          {addComment.error && <Alert severity="error">{addComment.error.message}</Alert>}
          <Box>
            <Button
              variant="contained"
              onClick={() => addComment.mutate()}
              disabled={comment.trim() === '' || addComment.isPending}
              data-testid="comment-submit"
            >
              Comment
            </Button>
          </Box>
        </Stack>
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
          <Stack sx={{gap: 1.25, borderLeft: 2, borderColor: 'divider', pl: 1.5}} data-testid="ticket-activity">
            {data.activity.map((activity) => (
              <HistoryEntry key={activity.id} activity={activity} />
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

/** What goes under the ticket: anything someone wrote or attached. The rest is history, in the sidebar. */
function isComment(activity: ActivityDto): boolean {
  return activity.kind === 'attached' || activity.comment !== null;
}

function ActorName({activity}: {activity: ActivityDto}) {
  return (
    <Box component="span" sx={{fontWeight: 700, color: activity.actor === 'agent' ? 'secondary.main' : 'text.primary'}}>
      {actorName(activity)}
    </Box>
  );
}

function When({at}: {at: string}) {
  return (
    <Typography variant="caption" color="text.secondary" title={new Date(at).toLocaleString('en-GB')}>
      {timeAgo(at)}
    </Typography>
  );
}

/** A comment under the ticket: who, when, what they wrote, and the picture when it is an attachment. */
function CommentEntry({ticketKey, activity}: {ticketKey: string; activity: ActivityDto}) {
  return (
    <Paper variant="outlined" sx={{p: 2}} data-testid="ticket-comment">
      <Stack direction="row" sx={{alignItems: 'baseline', gap: 1, mb: 0.5}}>
        <Typography variant="body2">
          <ActorName activity={activity} />
          {activity.kind === 'commented' ? '' : ` ${describeActivity(activity)}`}
        </Typography>
        <When at={activity.at} />
      </Stack>
      {activity.comment && <Markdown>{activity.comment}</Markdown>}
      {activity.kind === 'attached' && (
        <Link
          href={attachmentUrl(ticketKey, activity.id)}
          target="_blank"
          rel="noopener"
          sx={{display: 'block', mt: 1}}
        >
          <Box
            component="img"
            src={attachmentUrl(ticketKey, activity.id)}
            alt={activity.comment ?? activity.attachmentName ?? 'Attachment'}
            sx={{maxWidth: '100%', border: 1, borderColor: 'divider', borderRadius: 1}}
            data-testid="ticket-attachment"
          />
        </Link>
      )}
    </Paper>
  );
}

/** One line of history in the sidebar: who did what, and when. */
function HistoryEntry({activity}: {activity: ActivityDto}) {
  return (
    <Box>
      <Typography variant="body2">
        {activity.kind === 'created' ? 'Created' : <ActorName activity={activity} />}
        {activity.kind === 'created' ? '' : ` ${describeActivity(activity)}`}
      </Typography>
      <When at={activity.at} />
    </Box>
  );
}

function attachmentUrl(ticketKey: string, activityId: number): string {
  return `/api/tickets/${encodeURIComponent(ticketKey)}/attachments/${activityId}`;
}
