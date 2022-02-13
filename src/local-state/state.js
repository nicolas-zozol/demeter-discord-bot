import {promises as fs} from 'fs';
import {processEvent} from "./events-handler";
import logger from "../service/core/winston";

const databaseFile = ()=>process.env.STATE_DATABASE ||  __dirname + "/events.json"


let initiated = false;
const state = {
  started: false
};
const events = [];

export async function getState() {
  if (initiated) {
    return state;
  } else {
    try{
      events.push(...await loadEvents());
      for (let event of events){
        processEvent(state, event)
      }
      initiated = true;
      return state;
    }catch (e){
      logger.error('Unable to load app events from file', e)
      throw e
    }

  }
}

/**
 * Saves the event and return the new state
 * This is for exceptional system events, not for user messages processing
 */
export async function addEvent(event) {

  if (initiated) {
    // We keep here the same memory object in case it's used directly later
    try {
      events.push(event)
      Object.assign(state, processEvent(state, event));
      await saveEvents();
    }catch (e){
      logger.error('Unable to save the events', e);
      throw e;
    }
  } else {
    await getState();
    await addEvent(event);
  }

  return state

}


/**
 * No problem as longs there is no 30k events
 * @returns {Promise<object[]>}
 */
async function loadEvents() {
  return JSON.parse(await fs.readFile(databaseFile(), "utf-8"));
}


/**
 * No problem as longs there is no 30k events
 * @returns {Promise<string>}
 */
async function saveEvents() {
  await fs.writeFile(databaseFile(), JSON.stringify(events, null, 2), "utf-8");
}

/**
 * No problem as longs there is no 30k events
 * @returns {Promise<string>}
 */
export async function resetEvents() {
  await fs.writeFile(databaseFile(), JSON.stringify([], null, 2), "utf-8");
}

