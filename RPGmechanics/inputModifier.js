const modifier = (text) => {
  let modifiedText = text
  const lowered = text.toLowerCase()
  
  // BEGIN custom script
  
  // utility stuff:
  let stopInput = false // good to have
  
  if (lowered.includes("/r")) { // /r command - this will reset ALL stats and skills!
    delete state.RPGstate.init // init block will run again
    state.message = "Init reset done."
    stopInput = true // no model call
  }
  
  // BEGIN RPG mechanics
  // still utility:
  if(!state.RPGstate.showDC) {
    state.RPGstate.showDC = true
  }
  
  if (lowered.includes("/showdc")) { // /showDC command
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

  if (info.actionCount < 1) { // Only on first input
    classString = state.charClassType.toLowerCase() // make sure that any capitalization works
    // state.charClass = kobold // default to kobold :D
    // assign typed-in class, if it's defined: --FIX: do this smarter/dynamically
    if (classString === "witch") {
      state.charClass = classDB.witch.skills
    }
    if (classString === "barbarian") {
      state.charClass = barbarian
    }
    if (classString === "kobold") {
      state.charClass = kobold
    }
  }
  
  // initialize all the things!
  if (!state.init) { // but only if they aren't, yet
      // initialize stats fitting with InputDCattributeBot:
      state.stats = {
        stats:{
          Strength:{level: 0, cost:1},
          Dexterity:{level: 0, cost:1},
          Constitution:{level: 0, cost:1},
          Intelligence:{level: 0, cost:1},
          Wisdom:{level: 0, cost:1},
          Charisma:{level: 0, cost:1},
        },
        statPoints:5}
      // initialize skills:
      state.skills = {} // state.skills enables the skills menu; class skills object must fit with it!; definitions above
      for (curSkillID of state.charClass) {
        console.log("current ID checked: " + curSkillID)
        for (skillDef in skillDB) {
          console.log("current skillDB skilldef: " + skillDef)
          if (skillDef === curSkillID) {
            console.log(skillDB[skillDef].menuString)
            state.skills[skillDB[skillDef].menuString] = 0
          }
        }
      }
      state.skillPoints = 10
      state.disableRandomSkill = true
      state.XP = 0
      state.charFeats = ['flatchest']
      
      state.init = true // so it knows it's been initialized
  }
  
  // iterate over stats, raise costs if 4 or over:
  for (att in state.stats["stats"]) {
    if (state.stats["stats"][att]["level"] >= 4) {
      console.log(att + " over 3, setting cost to 2")
      state.stats["stats"][att]["cost"] = 2
    }
  }
  
  // skill processing
  for (let skill in state.skills) { // go through skills
    // console.log("Skill: " + skill)
    let skillMod = state.skills[skill] // get skill modifier from menu
    
    for (let skillDef in skillDB) {

          if (skillDB[skillDef].menuString === skill) {
            
            for (triggerStr of skillDB[skillDef].triggers) {
              
              triggerRegEx = new RegExp(triggerStr, "gi")
              caughtTrigger = text.match(triggerRegEx)
              
              if (caughtTrigger) {
                console.log(`Caught ${caughtTrigger}!`)
                if (!state.chkSitBonus) { // make state.var to grab in contextMod
                  state.chkSitBonus = 0
                }
                if (skillMod > state.chkSitBonus) { // if higher boost...
                  state.chkSitBonus = skillMod // ...use it
                  state.chkSitSkill = skillDef
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
