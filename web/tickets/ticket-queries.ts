import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {moveTicket} from '../../src/tickets/move-ticket';
import type {TicketListItemDto, TicketStatus} from '../../src/tickets/ticket-dto';
import {trackerApi} from '../api/tracker-api';

// Agents change tickets through MCP, not through this page, so the page polls to show their moves as they happen. It
// keeps polling in a background tab too, so the board is current the moment you switch to it.
const POLL_INTERVAL_MS = 2000;
const POLLING = {refetchInterval: POLL_INTERVAL_MS, refetchIntervalInBackground: true};

export const ticketKeys = {
  all: ['tickets'] as const,
  one: (key: string) => ['tickets', key.toUpperCase()] as const,
};

export function useTickets() {
  return useQuery({queryKey: ticketKeys.all, queryFn: trackerApi.getTicketsAsync, ...POLLING});
}

export function useTicket(key: string) {
  return useQuery({
    queryKey: ticketKeys.one(key),
    queryFn: () => trackerApi.getTicketAsync(key),
    ...POLLING,
  });
}

/** Moves the card at once and puts it back if the tracker refuses. */
export function useChangeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({key, status}: {key: string; status: TicketStatus}) => trackerApi.changeStatusAsync(key, status),
    onMutate: async ({key, status}) => {
      await queryClient.cancelQueries({queryKey: ticketKeys.all});
      const previous = queryClient.getQueryData<TicketListItemDto[]>(ticketKeys.all);
      queryClient.setQueryData<TicketListItemDto[]>(ticketKeys.all, (tickets) =>
        tickets?.map((ticket) => (ticket.key === key ? {...ticket, status} : ticket)),
      );
      return {previous};
    },
    onError: (_error, _variables, context) => queryClient.setQueryData(ticketKeys.all, context?.previous),
    onSettled: () => queryClient.invalidateQueries({queryKey: ticketKeys.all}),
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tickets: TicketListItemDto[]) => trackerApi.reorderAsync(tickets.map((ticket) => ticket.key)),
    onMutate: async (tickets) => {
      await queryClient.cancelQueries({queryKey: ticketKeys.all});
      const previous = queryClient.getQueryData<TicketListItemDto[]>(ticketKeys.all);
      queryClient.setQueryData(ticketKeys.all, tickets);
      return {previous};
    },
    onError: (_error, _variables, context) => queryClient.setQueryData(ticketKeys.all, context?.previous),
    onSettled: () => queryClient.invalidateQueries({queryKey: ticketKeys.all}),
  });
}

interface Move {
  key: string;
  status: TicketStatus;
  beforeKey: string | null;
}

/** A card dropped on the board. The card moves at once, using the same placement as the server. */
export function useMoveTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({key, status, beforeKey}: Move) => trackerApi.moveTicketAsync(key, status, beforeKey),
    onMutate: async ({key, status, beforeKey}) => {
      await queryClient.cancelQueries({queryKey: ticketKeys.all});
      const previous = queryClient.getQueryData<TicketListItemDto[]>(ticketKeys.all);
      queryClient.setQueryData<TicketListItemDto[]>(
        ticketKeys.all,
        (tickets) =>
          tickets && moveTicket(tickets, key, status, beforeKey).map((ticket, index) => ({...ticket, rank: index + 1})),
      );
      return {previous};
    },
    onError: (_error, _variables, context) => queryClient.setQueryData(ticketKeys.all, context?.previous),
    onSettled: () => queryClient.invalidateQueries({queryKey: ticketKeys.all}),
  });
}
