export function processEvent(state, event){
  switch (event.type){
    case 'APPLICATION_AVAILABLE':{
      state.available = true
    }
  }
  return state
}