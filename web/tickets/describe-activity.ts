import {STATUS_LABELS, type ActivityDto} from '../../src/tickets/ticket-dto';

export function describeActivity(activity: ActivityDto): string {
  switch (activity.kind) {
    case 'created':
      return 'created';
    case 'status-changed':
      return activity.fromStatus === null || activity.toStatus === null
        ? 'moved'
        : `moved ${STATUS_LABELS[activity.fromStatus]} → ${STATUS_LABELS[activity.toStatus]}`;
    case 'commented':
      return 'commented';
  }
}

const RELATIVE = new Intl.RelativeTimeFormat('en-GB', {numeric: 'auto'});

/** "just now", "2 minutes ago", "yesterday". */
export function timeAgo(at: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(at).getTime() - now.getTime()) / 1000);
  if (Math.abs(seconds) < 45) {
    return 'just now';
  }
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) {
    return RELATIVE.format(minutes, 'minute');
  }
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return RELATIVE.format(hours, 'hour');
  }
  return RELATIVE.format(Math.round(hours / 24), 'day');
}

export function actorName(activity: ActivityDto): string {
  return activity.actor === 'agent' ? 'Agent' : 'You';
}
