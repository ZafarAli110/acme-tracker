// Puts the tracker back to the seed tickets, all in To Do with no activity. Stop the tracker first.
import {deleteTrackerData, openTracker} from '../src/tracker';

deleteTrackerData();
openTracker();
console.log('Tracker reset. Start it with `bun start`.');
