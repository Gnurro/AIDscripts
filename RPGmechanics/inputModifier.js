const modifier = (text) => {
  let modifiedText = text
  const lowered = text.toLowerCase()

  // BEGIN RPG mechanics

  // utility stuff:
  let stopInput = false // good to have

  // /r command - this will reset ALL stats and skills!
  if (lowered.includes("/r")) {
    delete state.RPGstate.init // init block will run again
    state.message = "Init reset done."
    stopInput = true // no model call
  }

  // /showDC command
  if (lowered.includes("/showdc")) {
    if(state.RPGstate.showDC === true) {
      state.RPGstate.showDC = false
      state.message = "Turned DC display off."
    }
    if(state.RPGstate.showDC === false) {
      state.RPGstate.showDC = true
      state.message = "Turned DC display on."
    }
    stopInput = true // no model call
  }
  
  // skill processing:
  // TODO: fit this into new framework things
  for (let skill in state.skills) { // go through skills

    let skillMod = state.skills[skill] // get skill modifier from menu
    
    for (let skillDef in skillDB) {

          if (skillDB[skillDef].menuString === skill) {
            
            for (let triggerStr of skillDB[skillDef].triggers) {
              
              let triggerRegEx = new RegExp(triggerStr, "gi")
              let caughtTrigger = text.match(triggerRegEx)
              
              if (caughtTrigger) {
                console.log(`Caught '${caughtTrigger}' of '${skillDB[skillDef].menuString}'!`)
                if (!state.RPGstate.chkSitBonus) { // make state.var to grab in contextMod
                  state.RPGstate.chkSitBonus = 0
                }
                if (skillMod > state.RPGstate.chkSitBonus) { // if higher boost...
                  state.RPGstate.chkSitBonus = skillMod // ...use it
                  state.RPGstate.chkSitSkill = skillDef
                }
              }
            }
          }
        }
      }
  
  if (!stopInput && info.actionCount > 1) { // if the AI gets used
    state.inputBot = statSet.inputBot // let the inputBot do her job
  }
  // END RPG mechanics
   
  return { text: modifiedText, stop:stopInput }
}

// Don't modify this part
modifier(text)
