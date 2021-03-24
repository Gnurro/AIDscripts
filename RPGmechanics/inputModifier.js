const modifier = (text) => {
  let modifiedText = text
  const lowered = text.toLowerCase()
  
  // BEGIN custom script
  if (info.actionCount < 1) { // Only on first input
    modifiedText = text.replace(/\[|\]/g, '') // clean up the text that goes into history
  }
  
  // utility stuff:
  stopInput = false // good to have
  
  if (lowered.includes("/r")) { // /r command - this will reset ALL stats and skills!
    delete state.init // init block will run again
    state.message = "Init reset done."
    stopInput = true // no model call
  }
  
  // BEGIN RPG mechanics
  // still utility:
  if(!state.showDC) {
    state.showDC = false
  }
  
  if (lowered.includes("/showdc")) { // /showDC command
    if(state.showDC === true) {
      state.showDC = false
      state.message = "Turned DC display off."
    }
    if(state.showDC === false) {
      state.showDC = true
      state.message = "Turned DC display on."
    }
    stopInput = true // no model call
  }
  
  // toggles for when to check
  sayCheck = true
  doCheck = true
  greaterCheck = true // to check [story] inputs with '>' at the start
  storyCheck = true
  
  doTriggered = text.match(/> You /gi)
  sayTriggered = text.match(/> You (say|ask)/gi)
  greaterTriggered = text.match(/> /gi)
  
  if (sayTriggered && sayCheck) {
    console.log("[say] triggered!")
  } else if (doTriggered && doCheck) {
    console.log("[do] triggered!")
  } else if (greaterTriggered && greaterCheck) {
    console.log("[>] triggered!")
  } else if (storyCheck) {
    console.log("[story] triggered!")
  }
  

  
  if (info.actionCount < 1) { // Only on first input
    classString = state.charClassType.toLowerCase() // make sure that any capitalization works
    state.charClass = kobold // default to kobold :D
    // assign typed-in class, if it's defined: --FIX: do this smarter/dynamically
    if (classString === "witch") {
      state.charClass = witch
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
    state.inputBot = 'BIGinputDCattributeBot5' // let BIGinputDCattributeBot5 do her job
  }
  // END RPG mechanics
   
  return { text: modifiedText, stop:stopInput }
}

// Don't modify this part
modifier(text)
