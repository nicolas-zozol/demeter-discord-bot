import {addEvent, getState, resetEvents} from "./state.js";


const dirname = './src/local-state'
describe('Events are saved and processed, resulting into a memory state ', ()=>{
  beforeAll(()=>{
    process.env.STATE_DATABASE = dirname + "/events.tests.json"
  })

  afterAll(()=>{

  })

  beforeEach(async ()=>{
    await resetEvents()
  })


  test('it is able to have an empty directory', async ()=>{
    const expectedState = {
      available: false
    };
    const actual = await getState()
    expect(expectedState).toEqual(actual)

  })

  test('it is able to start the app', async ()=>{
    const expectedState = {
      available: true
    };
    await addEvent({
      type:'APPLICATION_AVAILABLE'
    })
    const actual = await getState()
    expect(expectedState).toEqual(actual)

  })
})
