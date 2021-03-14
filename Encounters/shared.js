// BEGIN Encounters!

// local devving helpers:
/*
state = {
    encounterPersistence:{}
}
worldInfo = []
*/

const encounterSettings = {
    debugMode: true,
    importWI: true
}

// encounterDef database:
const encounterDB = {
    // hardcoded encounters:
    // one open encounter (=encounters that have chance) will be made current at a time only (from consideration, branches might do more)
    // closed encounters (=encounters without chance) can only become current through chaining
    // there is only one current encounter at a time, and open encounters are only considered if there is no current encounter
    // order in this object determines precedence!
    /* REMOVE THIS LINE AND THE ONE AT THE END OF encounterDB TO SEE THE EXAMPLE ENCOUNTERS IN ACTION
    waveRedFlag: {
        encounterID: "waveRedFlag",
        triggers: ["redflag"],
        chance: 100,
        countOccurrence: true, // count how often this encounter ENDED
        recurrenceLimit: 1, // recurrenceLimit is independent of countOccurrence (for now; beta9 dev 11.03.21)
        message: "The red flag is waved!",
        duration: 0,
    },
    waveGreenFlag: {
        encounterID: "waveGreenFlag",
        chance: 100,
        prerequisite: [['waveRedFlag', 1]], // ALL items must have occurred at least the specified number of times to allow encounter to become current
        message: "The green flag is waved!",
        duration: 0,
    },
    waveBlueFlag: {
        encounterID: "waveBlueFlag",
        chance: 100,
        blockers: [['waveRedFlag', 1]], // if any of the items have occurred at least the specified number of times, do not allow encounter to become current
        message: "The blue flag is waved!",
        duration: 0,
    },
    displayStuff: {
        encounterID:"displayStuff",
        chance:100,
        displayStatNotes:[["Bugs","{amount}","{color}"], ["Bugs",100,"red"]],
        duration:0
    },
    randoTest: {
        encounterID: "randoTest",
        chance: 100,
        activationDelay: [1, 2],
        duration: [2, 5],
        cooldown: [1, 6]
    }
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
      textNotes:["The pebble is {*color}, with {*color} {pattern}. There was another {*color} one with {*color} {*pattern} and {*color} {*pattern}."],
      // textNotes:["The pebble is {color}, with {color} {pattern}. There was another {color} one with {color} {pattern} and {color} {pattern}."],
      duration:0,
    },
    dragonAwake:{
      encounterID:"dragonAwake",
      chance:100,
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
      totalActionDelay:0,
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
      totalActionDelay:2, // info.actionCount needs to be higher than this to allow encounter triggering; always allow encounter if missing
      chance:100, // in percent; if missing, there is no chance for this encounter to occur unless chained; if triggers should always start this encounter, set chance to 100
      triggers:["(?<=(spot|see|find).*)goblin", "(?<=enter.*)(cave|warren|thicket)"], // trigger words: if found in text, set encounter; regEx possible!; if missing from encounterDef, it will trigger based on chance alone!
      activationDelay:0, // how many actions after triggering this starts it's thing; can be omitted
      duration:0, // how many actions this sticks around; if there is no duration, encounter is endless, only ended by endTriggers; duration 0 leads to immediate end, for chaining
      // CHAINING
      // list of follow-up encounters! BD
      // chained:['goblinAttackRocks', 'goblinAttackHorde'] <- example for non-weighted list
      chainedWeighted:[['goblinAttackRocks',60], ['goblinAttackHorde',100]]
    },
    goblinAttackRocks:{
      encounterID:"goblinAttackRocks", // to indentify type of current encounter
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

// word list stuff like gauntlet script:
const encounterWordLists = {
    /* Remove this line (and the one below) to enable the example word lists
    charClass:["mage","fighter","valkyrie"],
    pattern:["sprinkles", "dots", "lines"],
    color:["red","blue","green","yellow","orange"],
    amount:["many","few","all of them"]
     */ // Remove this line (and the one above) to enable the example word lists
}

// WI data imports:
if (encounterSettings.importWI) {
    for (WIentry of worldInfo) {
        // encounters from WI:
        // these will be lower priority then the hardcoded ones above!
        if (WIentry.keys.includes('!encounterDef')) {
            let encounterDefFromWI = JSON.parse(WIentry.entry)
            encounterLog(`Found WI encounterDef for '${encounterDefFromWI.encounterID}', adding it to the DB!`)
            encounterDB[encounterDefFromWI.encounterID] = encounterDefFromWI
        }
        // word lists from WI:
        if (WIentry.keys.includes('!encounterWordListsFull')) {
            let encounterWordListsFromWI = JSON.parse(WIentry.entry)
            encounterLog(`Found full WI encounterWordLists entry, adding them to the DB!`)
            for (let encounterSingleWordList in encounterWordListsFromWI) {
                encounterWordLists[encounterSingleWordList] = Object.values(encounterWordListsFromWI[encounterSingleWordList])
            }
        }
        if (WIentry.keys.includes('!encounterWordListSingle')) {
            let encounterWordListSingleFromWI = JSON.parse(WIentry.entry)
            encounterLog(`Found WI encounterWordList, adding it to the DB!`)
            encounterWordLists[Object.keys(encounterWordListSingleFromWI)[0]] = Object.values(encounterWordListSingleFromWI)
        }
    }
}

// encounter functions: (DON'T MESS WITH THESE!)
function updateCurrentEncounter(encounterUpcoming) { // sets or clears currentEncounter; if argument empty, clears current encounter
    // encounter end effects:
    if (state.currentEncounter) {
        // recurrenceLimit:
        if (state.currentEncounter.recurrenceLimit) {
            if (!state.encounterPersistence) {
                state.encounterPersistence = {}
            }
            if (!state.encounterPersistence.limited) {
                state.encounterPersistence.limited = []
                state.encounterPersistence.limited.push([state.currentEncounter.encounterID, state.currentEncounter.recurrenceLimit - 1])
            } else {
                for (let limiter of state.encounterPersistence.limited) {
                    if (limiter[0] === state.currentEncounter.encounterID) {
                        encounterLog(`'${state.currentEncounter.encounterID}' recurrence already has a limit.`)
                        if (limiter[1] > 0) {
                            limiter[1] = limiter[1] - 1
                        }
                    } else {
                        state.encounterPersistence.limited.push([state.currentEncounter.encounterID, state.currentEncounter.recurrenceLimit - 1])
                    }
                }
            }
        }
        // cooldowns:
        if (state.currentEncounter.cooldown) {
            if (!state.encounterPersistence) {
                state.encounterPersistence = {}
            }
            if (!state.encounterPersistence.cooldowns) {
                state.encounterPersistence.cooldowns = []
            }
            state.encounterPersistence.cooldowns.push([state.currentEncounter.encounterID, state.currentEncounter.cooldown])
        }
        // occurrence counting:
        if (state.currentEncounter.countOccurrence) {
            if (!state.encounterPersistence) {
                state.encounterPersistence = {}
            }
            if (!state.encounterPersistence.counts) {
                state.encounterPersistence.counts = []
                state.encounterPersistence.counts.push([state.currentEncounter.encounterID, 1])
            } else countsChecker: {
                for (let count of state.encounterPersistence.counts) {
                    if (count[0] === state.currentEncounter.encounterID) {
                        encounterLog(`'${state.currentEncounter.encounterID}' already has a occurrence count.`)
                        count[1] += 1
                        break countsChecker
                    }
                }
                state.encounterPersistence.counts.push([state.currentEncounter.encounterID, 1])
            }
        }
        // adding memories:
        if (state.currentEncounter.memoryAdd) {
            if (!state.encounterPersistence) {
                state.encounterPersistence = {}
            }
            if (!state.encounterPersistence.memories) {
                state.encounterPersistence.memories = []
            }
            state.encounterPersistence.memories.push(state.currentEncounter.memoryAdd)
        }
    }
    if (encounterUpcoming) {
        encounterLog(`Setting current encounter to '${encounterUpcoming}'.`)
        state.currentEncounter = encounterDB[encounterUpcoming]
        // random initial values handling:
        const randomizables = ['duration', 'activationDelay', 'cooldown']
        for (let encounterValue of randomizables) {
            if (typeof (state.currentEncounter[encounterValue]) !== 'undefined') {
                if (typeof (state.currentEncounter[encounterValue]) !== 'number' && state.currentEncounter[encounterValue].length === 2) {
                    encounterLog(`${encounterUpcoming} has random ${encounterValue}: ${state.currentEncounter[encounterValue]}`)
                    state.currentEncounter[encounterValue] = getRndInteger(state.currentEncounter[encounterValue][0], state.currentEncounter[encounterValue][1])
                    encounterLog(`${encounterUpcoming} random ${encounterValue} set to ${state.currentEncounter[encounterValue]}`)
                }
            }
        }
    } else {
        encounterLog("Clearing current encounter.")
        delete state.currentEncounter
    }
}

function updateCurrentEffects() { // 'activates' currentEncounter; or clears encounter effects if there is no active encounter
    if (state.currentEncounter) {
        if (state.currentEncounter.messageString) {
            state.message = fillPlaceholders(state.currentEncounter.messageString)
        }
        if (state.currentEncounter.contextNotes) {
            if (!state.encounterPersistence) {
                state.encounterPersistence = {}
            }
            state.encounterPersistence.contextNote = fillPlaceholders(getRndFromList(state.currentEncounter.contextNotes))
        }
        if (state.currentEncounter.displayStatNotes) {
            displayStatsUpdate(getRndFromList(state.currentEncounter.displayStatNotes))
        }
    } else {
        delete state.message
        if (state.encounterPersistence) {
            if (state.encounterPersistence.contextNote) {
                delete state.encounterPersistence.contextNote
            }
        }


    }
}

function fillPlaceholders(placeHolderString) {
    let curPlaceholderMatches = placeHolderString.match(/\{(.*?)\}/g)
    if (curPlaceholderMatches) {
        encounterLog(`Matched placeholders: ${curPlaceholderMatches}`)
        for (let placeholder of curPlaceholderMatches) {
            encounterLog(`Current placeholder: ${placeholder}`)
            if (placeholder[1] === '*') {
                encounterLog(`Current placeholder ${placeholder} contains a *, checking temporary word lists...`)
                placeholder = placeholder.replace(/(\*|{|})/gi, '')
                if (typeof (tempWordLists) == 'undefined') {
                    tempWordLists = {}
                }
                if (!tempWordLists[placeholder] || tempWordLists[placeholder].length === 0) {
                    encounterLog(`${placeholder} temporary wordlist is either non-existant or empty! Getting a new one.`)
                    tempWordLists[placeholder] = JSON.parse(JSON.stringify(encounterWordLists[placeholder]))
                }
                encounterLog(`Current temporary word lists:${tempWordLists}`)
                for (let insertTag in tempWordLists) {
                    if (placeholder.includes(insertTag)) {
                        encounterLog(`Found fitting placeholder tag in temporary list: ${insertTag}`)
                        let pickedInsert = getRndFromList(tempWordLists[insertTag])
                        encounterLog(`Randomly picked placeholder insert from temporary list: ${pickedInsert}`)
                        let insertRegEx = new RegExp(`{\\*${insertTag}}`,)
                        placeHolderString = placeHolderString.replace(insertRegEx, pickedInsert)
                        tempWordLists[placeholder].splice(tempWordLists[placeholder].indexOf(pickedInsert), 1)
                    }
                }
            } else {
                for (let insertTag in encounterWordLists) {
                    if (placeholder.includes(insertTag)) {
                        encounterLog(`Found fitting placeholder tag: ${insertTag}`)
                        let pickedInsert = getRndFromList(encounterWordLists[insertTag])
                        encounterLog(`Randomly picked placeholder insert: ${pickedInsert}`)
                        let insertRegEx = new RegExp(`{${insertTag}}`,)
                        placeHolderString = placeHolderString.replace(insertRegEx, pickedInsert)
                    }
                }
            }
        }
        delete tempWordLists
    }
    return (placeHolderString)
}

// misc helper functions:
// get random
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

// list-picker, dynamically handles weighted lists
function getRndFromList(list) {
    if (list[0]) {
        if (list[0].length === 2) {
            encounterLog(`${list} looks like a weighted list, doing that!`)
            return (getRndFromListWeighted(list))
        } else {
            encounterLog(`${list} looks like a plain list with ${list.length} item(s), simply picking from it!`)
            return (list[getRndInteger(0, list.length - 1)])
        }
    } else {
        return ('')
    }
}

// list picker for lists with weighted items:
// currently works kinda like oldschool D&D encounter lists
function getRndFromListWeighted(weightedList) {
    let cutOff = getRndInteger(1, 100)
    encounterLog(`Picking from weighted list, cutoff: ${cutOff}`)
    for (let item of weightedList) {
        encounterLog(`'${item[0]}' threshold: ${item[1]}.`)
        if (cutOff <= item[1]) {
            encounterLog(`'${item[0]}' cutoff below threshold, picking it!`)
            return item[0]
        }
    }
}

// displayStats handling:
function displayStatsUpdate([inKey, inValue, inColor]) {
    // if key already exists, update; else push new entry; if no value given, removes displayStat entry matching key, if it exists
    if (!state.displayStats) {
        state.displayStats = []
    }
    let displayStatUpdated = false
    for (let displayStat of state.displayStats) {
        encounterLog(`Checking '${displayStat.key}' displayStats entry...`)
        let curDisplayStatIndex = state.displayStats.indexOf(displayStat)
        if (displayStat.key === inKey || displayStat.key === '\n' + inKey) {
            encounterLog(`Found '${inKey}' displayStats entry: ${state.displayStats[curDisplayStatIndex].key}, ${state.displayStats[curDisplayStatIndex].value}, ${state.displayStats[curDisplayStatIndex].color}, updating!`)
            if (inValue) {
                if (typeof (inValue) == 'string') {
                    inValue = fillPlaceholders(inValue)
                    encounterLog(`Value to update displayStat entry inputted: '${inValue}', updating.`)
                    state.displayStats[curDisplayStatIndex].value = inValue
                } else {
                    encounterLog(`Value to update displayStat entry inputted: '${inValue}', updating.`)
                    state.displayStats[curDisplayStatIndex].value = inValue
                }
            } else {
                encounterLog(`No value to update displayStat inputted, removing entry.`)
                state.displayStats.splice(curDisplayStatIndex, 1)
                displayStatUpdated = true
                break
            }
            if (inColor) {
                state.displayStats[curDisplayStatIndex].color = fillPlaceholders(inColor)
            }
            displayStatUpdated = true
            break
        }
    }
    if (displayStatUpdated === false) {
        encounterLog(`No ${inKey} displayStats entry found, adding it!`)
        if (state.displayStats.length > 0) {
            inKey = '\n' + inKey
        }
        state.displayStats.push({'key': inKey, 'value': inValue, 'color': inColor})
    }
}

function encounterLog(msg) {
    if (encounterSettings.debugMode === true) {
        console.log(msg)
    }
}

// END Encounters