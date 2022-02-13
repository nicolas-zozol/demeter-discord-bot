import {addEvent, getState, resetEvents} from "./state";


describe('Events are saved and processed, resulting into a memory state ', ()=>{
  beforeAll(()=>{
    process.env.STATE_DATABASE = __dirname + "/events.tests.json"
  })

  afterAll(()=>{

  })

  beforeEach(async ()=>{
    await resetEvents()
  })


  test('it is able to have an empty directory', async ()=>{
    const expectedState = {
      started: false
    };
    const actual = await getState()
    expect(expectedState).toEqual(actual)

  })

  test('it is able to start the app', async ()=>{
    const expectedState = {
      started: true
    };
    await addEvent({
      type:'APPLICATION_STARTED'
    })
    const actual = await getState()
    expect(expectedState).toEqual(actual)

  })
})
