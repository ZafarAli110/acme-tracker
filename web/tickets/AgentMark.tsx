import {Typography} from '@mui/material';
import type {ActivityDto} from '../../src/tickets/ticket-dto';
import {describeActivity, timeAgo} from './describe-activity';

/** Shown on a ticket whose latest change came from an agent, so the room can see what the agent did. */
export function AgentMark({activity}: {activity: ActivityDto}) {
  if (activity.actor !== 'agent') {
    return null;
  }
  return (
    <Typography variant="caption" color="secondary" sx={{display: 'block', mt: 0.75}} data-testid="agent-mark">
      ● Agent {describeActivity(activity)} · {timeAgo(activity.at)}
    </Typography>
  );
}
