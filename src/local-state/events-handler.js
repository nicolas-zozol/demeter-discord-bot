export function processEvent(state, event){
  switch (event.type){
    case 'APPLICATION_STARTED':{
      state.started = true
    }
  }
  return state
}