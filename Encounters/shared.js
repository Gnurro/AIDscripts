// BEGIN Encounters!
encounterDB = { // hardcoded encounters:
  // one global encounter (=encounters that do not need to be chained) can trigger at a time only (for now, may change this)
  // there is only one encounter at a time (for now, may change this), and global encounters can only start if there is no active encounter
  // order in this object determines precedence!
  /* REMOVE THIS LINE AND THE ONE AT THE END OF encounterDB TO SEE THE EXAMPLE ENCOUNTERS IN ACTION
  pickPebble:{
    encounterID:"pickPebble",
    triggers:["pick a pebble"],
    chance:100,
    branches:[
      {
        branchTriggers:["for your mate"],
        branchChance:100,
        branchTextNotes:["Your fellow {charClass} likes it!"], // wordlist placeholders work just like in the gauntlet script, and work on any textNotes
      },
      ],
    textNotes:["The pebble is {color}."],
    duration:0,
  },
  dragonAwake:{
    encounterID:"dragonAwake",
    chance:10,
    // memory insert, like World Events:
    // will be in order of encounters as they happen
    memoryAdd:{
      memoryText:"The ancient dragon has woken up.", // WARNING: This will *not* be visible to the player!
      memoryLocation:"top", // top = before player mem, bottom = after player mem; defaults to top
      memoryGreed:false, // safety thingy to prevent hijacking, compatibility; KEEP THIS false OR DO NOT EVEN PUT IT IN UNLESS YOU WANT TO BREAK THINGS! -> if set to true, the memoryText will just get shoved in there, even if it then gets cut off later
      memoryLingerDuration:10 // how long this sticks around after the encounter; World Event style
    },
    duration:0,
    cooldown:20, // better keep cooldown above memoryLingerDuration...
  },
  spotTheDevs:{
    encounterID:"spotTheDevs", // MUST match the encounterDB key!!! needed to limit encounters
    // lock checking:
    inputLock:false, // don't lock input checking; can be omitted
    outputLock:true, // but ignore AI outputs; can be omitted
    triggers:["code"],
    chance:100,
    duration:0,
    // adding WI:
    addWI:[{keys:"dev,latitude,nice people", entry:"The Latitude devs are nice people.", hidden:false}], // ...should work?; takes list, so can add more than one WI entry
    // limiting encounter recurrence
    recurrenceLimit:1, // this encounter can happen only one time
    textNotes:["You learn something about the devs..."] // text to be attached to the triggering (text), either input or output, depending on what triggered it
  },
  dance:{ // example for precedence, if 'you dance' while 'you enter a cave', only 'dance' happens, but not the goblinAttack stuff below; also an almost minimal encounterDef
    encounterID:"dance",
    globalActionDelay:0,
    triggers:["dance"],
    chance:100,
    duration:0,
    cooldown:5, // cooldown will start immediatly when encounter ends, so 1 for immediate cooldown, which is kinda redundant, but may be useful for testing; WARNING: due to how JS works (and lazyness), cooldown:0 will just not do anything.
    // weighted list: from lowest to highest, 1-100; function basically rolls a d100 and picks the first list item that fits:
    textNotesWeighted:[["You dance well.", 30],[`You "dance".`,70],[`You fall over.`,100],], // example: 30% chance for good dancing (0->30=30), 40% wobbling about (30->70=40), 30% derping out hard (70->100=30).
    // weighted lists work for all picking lists, but have to be defined as such (key ending in "Weighted") (for now, might add thingy that checks, but that entails hardcode...)
  },
  goblinAttackInit:{ // this is an 'initializer' encounter, it does nothing but trigger by itself and then chain into one of two random followup encounters
    encounterID:"goblinAttackInit", // to indentify type of current encounter;
    globalActionDelay:2, // info.actionCount needs to be higher than this to allow encounter triggering; always allow encounter if missing
    chance:100, // in percent; if missing, there is no chance for this encounter to occur unless chained; if triggers should always start this encounter, set chance to 100
    triggers:["(?<=(spot|see|find).*)goblin", "(?<=enter.*)(cave|warren|thicket)"], // trigger words: if found in text, set encounter; regEx possible!; if missing from encounterDef, it will trigger based on chance alone!
    triggerDelay:0, // how many actions after triggering this starts it's thing; can be omitted
    duration:0, // how many actions this sticks around; if there is no duration, encounter is endless, only ended by endTriggers; duration 0 leads to immediate end, for chaining
    // CHAINING
    // list of follow-up encounters! BD
    // chained:['goblinAttackRocks', 'goblinAttackHorde'] <- example for non-weighted list
    chainedWeighted:[['goblinAttackRocks',60], ['goblinAttackHorde',100]]
  },
  goblinAttackRocks:{
    encounterID:"goblinAttackRocks", // to indentify type of current encounter
    inputLock:true, // since this is chain-only, setting these keeps the logs tidy
    outputLock:true, // since this is chain-only, setting these keeps the logs tidy
    duration:3, // how many actions this sticks around; if there is no duration, encounter is endless, only ended by endTriggers; duration 0 leads to immediate end, for chaining
    endTriggers:["(?<=(hit|kill|scare).*)goblin","/(?<=you.*).+(((leave|escape|flee).*)(?!=you.*)(cave|warren|thicket))"], // to end the encounter based on (text); soft-required for no-duration/infinite encounters
    messageString:"Goblin attack!", // to be shown in state.message; optional
    contextNotes:["[You are suddenly attacked by a goblin!]","[A single goblin throws rocks at you.]"], // what's shown to the AI; one gets picked at random when the encounter is started; goes below AN in context
    textNotes:["A goblin starts throwing rocks at you."],
    chained:['goblinEscape1',]
  },
  goblinEscape1:{
    encounterID:"goblinEscape1", // to indentify type of current encounter
    inputLock:true,
    duration:3, // how many actions this sticks around
    messageString:"Goblin flees!", // to be shown in state.message
    contextNotes:["[The goblin stops throwing rocks at you.]"], // what's shown to the AI; one gets picked at random when the encounter is run
    textNotes:["The goblin stops throwing rocks at you and runs away."]
  },
  goblinAttackHorde:{
    encounterID:"goblinAttackHorde", // to indentify type of current encounter
    inputLock:true,
    messageString:"Goblin attack!", // to be shown in state.message; optional
    contextNotes:["[A horde of goblins is attacking you!]","[You are being attacked by goblins!]",], // what's shown to the AI; one gets picked at random when the encounter is run; optional
    textNotes:["A horde of goblins starts attacking you.",],// optional
    branches:[
      {
        branchID:'impressive',
        branchTriggers:["impress the goblins"], // basically like endTriggers, but with individual chained
        branchChance:100, // to keep things parallel; this means branches NEED it
        branchChained:['becomeGoblinChief'],
      },
      {
        branchID:'dragonScare',
        branchChance:5, // to keep things parallel
        branchTextNotes:["The goblins run away in panic as a dragon arrives!"], // to be immediately inserted; does not wait for chained encounter activation!; keeping branches compact, so leave out other inserts
        branchChained:['dragonAttack'],
      },
      ],
    endTriggers:["(?<=(hit|kill|scare).*)goblin","/(?<=you.*).+(((leave|escape|flee).*)(?!=you.*)(cave|warren|thicket))"], // to end the encounter based on (text); soft-required for no-duration/infinite encounters
    chained:['goblinEscapeHorde',]
  },
  becomeGoblinChief:{
    encounterID:"becomeGoblinChief", // to indentify type of current encounter
    inputLock:true,
    duration:0, // how many actions this sticks around
    messageString:"Goblins make you chief!", // to be shown in state.message
    textNotes:["The goblins are so impressed by you that they make you their chief."],
    addWI:[{keys:"goblin", entry:"You are the goblin chief.", hidden:false}],
  },
  goblinEscapeHorde:{
    encounterID:"goblinEscapeHorde", // to indentify type of current encounter
    inputLock:true,
    duration:3, // how many actions this sticks around
    messageString:"Goblins flee!", // to be shown in state.message
    contextNotes:["[The horde of goblins is running away!]","[The goblins are suddenly running away!]"], // what's shown to the AI; one gets picked at random when the encounter is run
    textNotes:["The horde of goblins runs away."]
  },
  dragonAttack:{
    encounterID:"dragonAttack", // to indentify type of current encounter
    inputLock:true,
    duration:3, // how many actions this sticks around
    messageString:"Dragon attack!", // to be shown in state.message
    contextNotes:["A dragon is burning down everything!"], // what's shown to the AI; one gets picked at random when the encounter is run
    textNotes:["Suddenly, a dragon burns down everything.","Suddenly, a dragon shows up!"]
  },
  weather:{ // was once a minimal encounterDef; last in object to not prevent other encounters
    encounterID:"weather",
    chance:50, // 50% chance to happen every action
    branches:[
      {
        branchID:'goodKid',
        branchTriggers:["finish your plate"], // basically like endTriggers, but with individual chained possible
        branchChance:100, // to keep things parallel; this means branches NEED it
        branchTextNotes:["It's sunny!"],
        branchChained:[], // you can stop the current encounter doing this
      },
    ],
    duration:0,
    chained:['badWeather']
  },
  badWeather:{ // super minimal encounterDef: puts in note, then poofs
    encounterID:"badWeather",
    duration:0,
    textNotes:["It's rainy.","It's cloudy."],
  }
  */ // REMOVE THIS LINE AND THE ONE AT THE START OF encounterDB TO SEE THE EXAMPLE ENCOUNTERS IN ACTION
}

// encounters from WI:
// these will be lower priority then the hardcoded ones above!
for (WIentry of worldInfo) {
  if (WIentry.keys.includes('!encounterDef')) {
    encounterDefFromWI = JSON.parse(WIentry.entry)
    console.log(`Found WI encounterDef for '${encounterDefFromWI.encounterID}', adding it to the DB!`)
    encounterDB[encounterDefFromWI.encounterID] = encounterDefFromWI
  }
}

// word list stuff like gauntlet script:
encounterWordLists = {
  color:["red","blue","green","yellow"],
  charClass:["mage","fighter","valkyrie"],
}

// encounter functions: (DON'T MESS WITH THESE!)
function updateCurrentEncounter(encounter) { // sets or clears currentEncounter; if argument empty, clears current encounter
  // limiting encounter recurrence:
  if (state.currentEncounter) {
    if (state.currentEncounter.recurrenceLimit) {
      if(!state.limitedEncounters) {
        state.limitedEncounters = []
        state.limitedEncounters.push([state.currentEncounter.encounterID, state.currentEncounter.recurrenceLimit-1])
      } else {
        for (limiter of state.limitedEncounters) {
          if (limiter[0] == state.currentEncounter.encounterID) {
            console.log(`'${state.currentEncounter.encounterID}' recurrence already has a limit.`)
            if (limiter[1] > 0) {
              limiter[1] = limiter[1]-1  
            }
          } else {
            state.limitedEncounters.push([state.currentEncounter.encounterID, state.currentEncounter.recurrenceLimit-1])
          }
        }
      }
    }
    if (state.currentEncounter.cooldown) {
      if(!state.cooldownEncounters) {
        state.cooldownEncounters = []
      }
      state.cooldownEncounters.push([state.currentEncounter.encounterID, state.currentEncounter.cooldown])
    }
  }
  if (encounter) {
    console.log(`Setting current encounter to '${encounter}'.`)
    state.currentEncounter = encounterDB[encounter]
  } else {
    console.log("Clearing current encounter.")
    delete state.currentEncounter
  }
}
function updateCurrentEffects() { // 'activates' currentEncounter; or clears encounter effects if there is no active encounter
  if (state.currentEncounter) {
    if (state.currentEncounter.messageString) {
      state.message = state.currentEncounter.messageString
    }
    if (state.currentEncounter.contextNotes) {
      state.encounterNote = getRndFromList(state.currentEncounter.contextNotes)
    } else if (state.currentEncounter.contextNotesWeighted) {
      state.encounterNote = getRndFromListWeighted(state.currentEncounter.contextNotesWeighted)
    }
  } else {
    delete state.message
    delete state.encounterNote
  }
}
// misc helper functions:
// get random
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min
}
// generic list-picker
function getRndFromList(list) {
  return (list[getRndInteger(0, list.length)])
}
// list picker for lists with weighted items:
// currently works kinda like oldschool D&D encounter lists
function getRndFromListWeighted(weightedList) {
  cutOff = getRndInteger(1, 100)
  console.log(`Picking from weighted list, cutoff: ${cutOff}`)
  for (item of weightedList) {
    console.log(`'${item[0]}' threshold: ${item[1]}.`)
    if (cutOff <= item[1]) {
      console.log(`'${item[0]}' cutoff below threshold, picking it!`)
      return item[0]
      break
    }
  }
}

// END Encounters