const modifier = (text) => {
  
  // BEGIN rpg mechanics
  
  // progression:
  // TODO: use generic+safe displayStatsUpdate function!
  if (state.RPGstate.XP >= 100) { // if player got more then 100 XP...
    state.RPGstate.XP -= 100 // ...substract 100 XP,...
    state.stats.statPoints += 1 // ...add a stat point,...
    state.skillPoints += 10 // ...add ten skill points...
    state.displayStats.push({key:'\nLevel up', value: 'Points added!', color: 'yellow'}) // ...and tell the player in the info box.
  }
  
  // infobox at the top right:
  if (state.stats.statPoints > 0 || state.skillPoints > 0) { // if there are unspent points...
    state.displayStats = [{key:'You have unspent points! Open the menus to the right', value: '--->', color: 'red'}] // ...show people that they have points to spend and POINT AT MENUS
    state.displayStats.push({key:'\nXP', value: state.RPGstate.XP, color: 'green'}) // also show current XP
  } else {
    state.displayStats = [{key:'XP', value: state.RPGstate.XP, color: 'green'}] // show current XP
  }
  
  // reading in stats from menu:
  // TODO: make this work based on statSet
  intMod = state.stats["stats"]["Intelligence"]["level"]
  chaMod = state.stats["stats"]["Charisma"]["level"]
  wisMod = state.stats["stats"]["Wisdom"]["level"]
  strMod = state.stats["stats"]["Strength"]["level"]
  dexMod = state.stats["stats"]["Dexterity"]["level"]
  conMod = state.stats["stats"]["Constitution"]["level"]
  
  if (info.actionCount > 1 && state.inputBot) {
    RPGmechsLog(info?.inputEvaluation) // log what the bot came up with
  
  // put bot output into handy variables:
  chkAtt = info?.inputEvaluation["Attribute"]
  chkDC = info?.inputEvaluation["DC"]
  chkCuz = info?.inputEvaluation["reason"]
  
  // turn off bot; cleanup
  delete state.inputBot
  
  // use difficulty to scale XP:
  chkXP = chkDC/5 // DC are divisible by five, so this probably works
  
  // optional DC display:
  if (state.showDC) { // if the display is on (iE, state.showDC == true)...
    state.message = statList[chkAtt].icon + " DC " + chkDC + ": " + chkCuz // ...show the attribute, DC and reason in state.message
  } else { // if the display is off (iE, state.showDC == false)...
    state.message = chkCuz // ...show only the reason
  }
  
  
  // get check attribute from bot output and assign appropriate attribute modifiers:
  if (chkAtt != null) { // if the bot does come up with anything
    if (chkAtt.includes("Any")) { // bot sometimes gives that one; just take it as 'too generic'
      chkCurAtt = 0 // so it gets no attribute bonus
      chkAttPosAdj = "good" // this is the crucial bit for generation, but since the bot said it's generic...
      chkAttNegAdj = "bad" // ...AI is told generic things below
    }
    if (chkAtt.includes("Intelligence")) { // when the bot comes up with an attribute...
      chkCurAtt = intMod // ...assign the appropriate attribute modifier...
      chkAttPosAdj = "smart" // ...and use a fitting positive word...
      chkAttNegAdj = "dumb" // ...or negative word to let the AI know for generation below
    }
    // same as above, for all attributes:
    if (chkAtt.includes("Wisdom")) {
      chkCurAtt = wisMod
      chkAttPosAdj = "wise"
      chkAttNegAdj = "oblivious"
    }
    if (chkAtt.includes("Charisma")) {
      chkCurAtt = chaMod
      chkAttPosAdj = "charming"
      chkAttNegAdj = "annoying"
    }
    if (chkAtt.includes("Strength")) {
      chkCurAtt = strMod
      chkAttPosAdj = "strong"
      chkAttNegAdj = "weak"
    }
    if (chkAtt.includes("Dexterity")) {
      chkCurAtt = dexMod
      chkAttPosAdj = "nimble"
      chkAttNegAdj = "clumsy"
    }
    if (chkAtt.includes("Constitution")) {
      chkCurAtt = conMod
      chkAttPosAdj = "tough"
      chkAttNegAdj = "scrawny"
    }
    
    // skill handling:
    if (typeof(state.chkSitBonus) !== 'undefined') { // if there's a skill bonus...
      chkCurSit = chkCurAtt + state.chkSitBonus // ...add it to the attribute modifier to get the full check modifier
      
      // get skill-dependent result strings:
      for (let skillDef in skillDB) {
        if (skillDef === state.chkSitSkill) {
          console.log("found skillDef for current skill:" + skillDef)
          if (skillDB[skillDef].overrideAtt === true) {
            overrideAtt = true
            chkSkillPosStr = skillDB[skillDef].results['positive']
            chkSkillNegStr = skillDB[skillDef].results['negative']
          }
          if (skillDB[skillDef].overrideAtt === false) {
            overrideAtt = false
            chkSkillPosStr = skillDB[skillDef].results['positive']
            chkSkillNegStr = skillDB[skillDef].results['negative']
          }
        }
      }
      
    } else { // if there's no skill bonus...
      chkCurSit = chkCurAtt // ...just use the attribute modifier
    }
    
    
    // Feats handling:
    
    for (feat of state.charFeats) {
      console.log(feat)
    }
    
    
    // the actual check:
    roll = getRndInteger(1,20) // pretend to 'roll a twenty-sided die'
    chkModRoll = roll + chkCurSit // add the check modifier to the roll to get the result
    if (chkModRoll >= chkDC) { // if the result beats the DC...
      chkResult = "Success!" // ...put the result in words for the player...
      if (typeof(chkSkillPosStr) !== 'undefined') {
        if (overrideAtt == true) {
          resultContextString = `[${chkSkillPosStr}]` // ...and in words for the AI, as well,...
        }
        if (overrideAtt == false) {
          resultContextString = `[You are ${chkAttPosAdj} enough for that right now, and ${chkSkillPosStr}.]` // ...and in words for the AI, as well,...
        }
      } else {
        resultContextString = `[You are ${chkAttPosAdj} enough for that right now.]`
      }
      state.XP += chkXP // ...then add appropriate XP
    } else { // if the result does NOT beat the DC...
      chkResult = "Fail!" // ...put the result in words for the player...
       if (typeof(chkSkillNegStr) !== 'undefined') {
        if (overrideAtt == true) {
          resultContextString = `[${chkSkillNegStr}]` // ...and in words for the AI, as well,...
        }
        if (overrideAtt == false) {
          resultContextString = `[You are too ${chkAttNegAdj} for that right now, and ${chkSkillNegStr}.]` // ...and in words for the AI, as well,...
        }
      } else {
        resultContextString = `[You are too ${chkAttNegAdj} for that right now.]`
      }
      if (chkXP > 1) { // ...make sure to not add half XP...
        chkXP = Math.floor(chkXP/2) // ...by rounding up after halving...
      }
      state.XP += chkXP // ...then add appropriate XP
    }
    
    // update XP display:
    state.displayStats = [{key:'XP', value: state.XP, color: 'green'}]
    
    // display the full line at the bottom:
    if (info.actionCount >= 2) { // but only if it's useful and possible
      state.message += ` ${chkAtt} roll: ${chkModRoll} (${roll}${makeModString(chkCurAtt)}${makeModString(state.chkSitBonus)}), ${chkResult} XP gained: ${chkXP}` // add all the check stuff to the message
    }
    
    // clean up:
    if (typeof(state.chkSitBonus) !== 'undefined') { // if there's a skill bonus...
      delete state.chkSitBonus // ...get rid of it, so it doesn't go into next check
      delete state.chkSitSkill
    }
  }
  
  for (feat of state.charFeats) {
      console.log(feat)
    }
  
  }
  // END rpg mechanics
  
  const contextMemory = info.memoryLength ? text.slice(0, info.memoryLength) : ''
  const context = info.memoryLength ? text.slice(info.memoryLength + 1) : text
  const lines = context.split("\n")
  
  // BEGIN rpg mechanics
  // THE MAGIC:
  if (typeof(resultContextString) !== 'undefined') { // if there's a result to tell AI...
      lines.splice(-1, 0, resultContextString) // ...put it right below the players input, so AI knows what the check did
      delete resultContextString
  }
  // END rpg mechanics
  
  const combinedLines = lines.join("\n").slice(-(info.maxChars - info.memoryLength))
  var finalText = [contextMemory, combinedLines].join("")
  return { text: finalText }
}

// Don't modify this part
modifier(text)
