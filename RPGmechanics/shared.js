// BEGIN RPG mechanic stuff

var bracketed = /\[(.*?)\]/g // somehow needs to go here, due to AID scope being super-weird...

// base init stuff:
if (!state.RPGstate) {
    state.RPGstate = {}
}

// swap for neater code - backswap needed! (or not...? JS is weird...)
RPGstate = state.RPGstate

if (!RPGstate?.showDC) {
    RPGstate.showDC = true
}

const miscConfig = {
    successMessage: `Success!`,
    failMessage: `Fail!`,
    messageStatIcon: true,
    showXP: true,
    showCharLevel: true,
    showDC: true,
    showFancyHP: true,
    showResources: true,
    doLog: true,
    hardLog: true
}

// MANDATORY generic character sheet initializer:
if (!RPGstate?.charSheet) {
    RPGstate.charSheet = {
        name: "",
        class: "",
        level: 1,
        XP: 0,
        skills: [],
        // resources:
        resources: {
            HP: {
                base: 3,
                current: 3,
                regen: 20,
            },
        },
        // specific:
        petType: "",
        petName: ""
    }
}

// MANDATORY prompt processing setup:
const introBracketConfig = {
    brackets: [
        // NOTE: order in this array MUST match the order of brackets in the intro prompt!
        "name",
        "class",
        // specific:
        "petType",
        "petName"
    ]
}

// MANDATORY classes:
const classDB = {
    witch: {
        skills: ['cackle', 'potBrew', 'dance', 'petHandle'],
        feats: ['jolly'],
        // which non-HP resources this class has, which stat gives more of it and starting amounts:
        resources: {
            MP: {
                stat: `Charisma`,
                base: 3,
                current: 3,
                // number of actions to restore one point: (SUBJECT TO CHANGE)
                regen: 2,
                // display bar color; progression possible: from high to low, uses HTML color names or hex; currently has three levels: more then half, less than half, less than third
                colors: ['DarkBlue','Blue','CornflowerBlue']
            },
        },
    },
    barbarian: {
        skills: ['rockThrow', 'rage', 'intimidate', 'heavyLift'],
        resources: {
            RAGE: {
                stat: `Constitution`,
                base: 3,
                current: 3,
                regen: 6,
                colors:['Red','DarkRed','FireBrick']
            },
        },
    },
    kobold: {skills: ['buildTraps', 'hide', 'dragon', 'mining'],},
}

// OPTIONAL grab character info from placeholders:
if (info.actionCount < 1) {
    // convenience swap:
    charSheet = RPGstate.charSheet

    // use the introBracketSet to get character info from intro prompt:
    for (let bracket in introBracketConfig.brackets) {
        charSheet[introBracketConfig.brackets[bracket]] = grabBracket(bracket)
    }

    // add class skills to charSheet:
    charSheet.skills = classDB[charSheet.class.toLowerCase()].skills

    // add class-based resources to charSheet:
    for (let resource in classDB[charSheet.class.toLowerCase()].resources) {
        charSheet.resources[resource] = classDB[charSheet.class.toLowerCase()].resources[resource]
    }

    RPGmechsLog(`Read character information from intro prompt:`)
    RPGmechsLog(charSheet)

    // convenience backswap:
    RPGstate.charSheet = charSheet
}

// MANDATORY stats + bot setup:
statConfig = {
    // MANDATORY the inputBot that is used for general actions:
    inputBot: "BIGinputDCattributeBot5",
    botOutputs: {
        // these MUST match the exact bot output value names!
        stat: `Attribute`,
        dc: `DC`,
        cuz: `reason`, // ...might change this to something better. 😏
    },
    rolling: {
        checkRollRange: [1, 20],
    },
    // MANDATORY the stats/attributes it can output:
    statList: {
        unknown: {
            // safety measure for DCbot derpiness
            name: "Unknown",
            tag: "UNK",
            icon: "???",
            successAdjective: "good",
            failAdjective: "bad",
            ignoreForMenu: true // use this for 'bot derpness catchers' that shouldn't show up in the stats menu
        },
        intelligence: {
            name: "Intelligence",
            tag: "INT",
            icon: "🧠",
            successAdjective: "smart",
            failAdjective: "dumb",
        },
        wisdom: {
            name: "Wisdom",
            tag: "WIS",
            icon: "🤔",
            successAdjective: "wise",
            failAdjective: "oblivious",
        },
        charisma: {
            name: "Charisma",
            tag: "CHA",
            icon: "😎",
            successAdjective: "impressive",
            failAdjective: "annoying",
        },
        strength: {
            name: "Strength",
            tag: "STR",
            icon: "💪",
            successAdjective: "strong",
            failAdjective: "weak",
        },
        dexterity: {
            name: "Dexterity",
            tag: "DEX",
            icon: "💃",
            successAdjective: "nimble",
            failAdjective: "clumsy",
        },
        constitution: {
            name: "Constitution",
            tag: "CON",
            icon: "😣",
            successAdjective: "tough",
            failAdjective: "scrawny",
        },
    },
    // MANDATORY starting values for menus:
    starting: {
        level: 0,
        points: 5,
        cost: 1,
    },
    // OPTIONAL raise statPoint costs:
    raise: [
        // threshold is INCLUSIVE, as current level is checked BEFORE raising:
        {threshold: 4, newCost: 2}, // this means going from 4 to 5 costs 2
        {threshold: 9, newCost: 3}, // this means going from 9 to 10 costs 3
    ],
    // locking inputBot on trivial actions:
    locking: {
        lockTriggers: [`walk`, `breathe`],
        lockArbitraryChecks: true
    }
}

// MANDATORY configure skill menu setup:
const skillConfig = {
    // MANDATORY starting menu values:
    starting: {
        points: 10,
        level: 0,
    },
    // OPTIONAL, BUT REALLY REALLY WEIRD AND REMOVAL DISCOURAGED stopping random skill generation:
    forbidRandom: true, // letting it do this will not create fully set-up skills, which WILL break this framework
}

// MANDATORY skills:
const skillDB = {

    // kobold = ['buildTraps', 'hide', 'dragon', 'mining']

    buildTraps: {
        menuString: "Trap Building", // name to be displayed in the skills menu; also the identifier in skills menu processing
        triggers: ["\\b(build(ing)*|set(ting)*( up)*|lay down)(?=(trap(s)*|snare(s)*)", "\\bdig( up)*(?=pit(fall)*)", "\\bset(?=trigger(s)*)"], // to be regEx'd
        overrideAtt: true, // if this skills result strings override the att string
        results: {
            positive: ["You are great at setting this up."],
            negative: ["You mess up the construction."]
        }
    },

    // barbarian = ['rockThrow', 'rage', 'intimidate', 'heavyLift']

    heavyLift: {
        menuString: "Heavy Lifting",
        triggers: ["\\b(lift(ing)*|heav(e|ing)*|heft(ing)*|hoist(ing)*|grab(bing)*)",] // to be regEx'd
    },

    rage: {
        menuString: "Rage",
        triggers: ["\\brag(e|ing(ly)*)", 'ang(er(ed)*|r(y|ily))'], // to be regEx'd
        overrideAtt: false, // if this skills result strings override the att string
        results: {
            positive: ["do it brutally well in your rage"],
            negative: ["mess it up in your fury"]
        },
        resource: `RAGE`
    },

    rockThrow: {
        menuString: "Rock Throwing",
        triggers: ["\\b(hurl(ing)*|throw(ing)*|yeet(ing)*|lob(bing)*|chuck(ing)*)(?=(rock|boulder|stone))",], // to be regEx'd
        overrideAtt: false, // if this skills result strings override the att string
        results: {
            positive: ["launch the rock"],
            negative: ["drop the rock"]
        }
    },

    intimidate: {
        menuString: "Intimidation", // display name in the skills menu
        triggers: ["\\bscar(e|ing)", "\\bintimidat(e|ing(ly)*)", "\\bmenac(e|ing(ly)*)", "\\bcoerce"], // to be regEx'd
        overrideAtt: true, // if this skills result strings override the att string; more functionality to be added!
        results: {
            positive: ["You are quite intimidating."],
            negative: ["You don't scare anyone right now."]
        }
    },

    // witch = ['cackle', 'potBrew', 'dance', 'petHandle']

    potBrew: {
        menuString: "Potion Brewing",
        triggers: ["\\bpotion", "\\bbrew(?<=potion)(?=potion)", "\\bvial", "\\balchem(ic(al(y)*)*|y)"], // to be regEx'd
        overrideAtt: true, // if this skills result strings override the att string
        results: {
            positive: ["You use your alchemical acumen."],
            negative: ["You mess up the formula."]
        }
    },

    petHandle: {
        // requires pet stuff on character sheet!
        menuString: capFirstLetter(RPGstate.charSheet.petType) + " Handling",
        triggers: [`\\b${RPGstate.charSheet.petType}(?<=your)`, `\\b${RPGstate.charSheet.petName}`], // to be regEx'd
        overrideAtt: true, // if this skills result strings override the att string
        results: {
            positive: [`You have great rapport with your ${RPGstate.charSheet.petType}.`],
            negative: [`Your ${RPGstate.charSheet.petType} doesn't follow your commands!`]
        }
    },

    dance: {
        menuString: "Dancing",
        triggers: ["\\bdanc(e|ing)", "\\btwirl", "\\btwist", "\\bpranc(e|ing)", "\\bpirouett(e|ing)"], // to be regEx'd
        overrideAtt: false, // if this skills result strings override the att string
        results: {
            positive: ["perform beautifully"],
            negative: ["stumble around"]
        }
    },

    cackle: {
        menuString: "Cackling",
        triggers: ["\\bcackl(e|ing)"], // to be regEx'd
        resource: `MP`
    }
}

// Feats!
// Stuff that does context notes independent of skill use or checks and prolly sth for checks as well
// TODO: ...feats.
const featDB = {}

// initialize all the things!
if (!state.RPGstate.init) { // but only if they aren't, yet

    // BEGIN vanilla menu initializations:
    RPGmechsLog(`Initializing menus...`)
    // initialize stats menu as defined in statSet:
    if (!state.stats) {
        state.stats = {stats: {}}
    }
    for (let statID in statConfig.statList) {
        if (!statConfig.statList[statID].ignoreForMenu === true) {
            state.stats.stats[statConfig.statList[statID].name] = {
                level: statConfig.starting.level,
                cost: statConfig.starting.cost
            }
            RPGmechsLog(`Added '${statID}' stat to stats menu as '${statConfig.statList[statID].name}'.`)
        } else {
            RPGmechsLog(`Ignored '${statID}' stat for stats menu adding.`)
        }

    }
    state.stats.statPoints = statConfig.starting.points

    // initialize skills menu according to charSheet:

    // state.skills enables the skills menu; class skills object must fit with it!
    state.skills = {}

    sheetSkillLoop:
        for (let curSkillID of charSheet.skills) {
            RPGmechsLog(`Trying to add '${curSkillID}' skill from character sheet to menu.`)
            for (let skillDef in skillDB) {
                // RPGmechsLog(`Looking at '${skillDef}' in skillsDB...`)
                if (skillDef === curSkillID) {
                    RPGmechsLog(`Found fitting skill definition '${skillDef}' matching '${curSkillID}' in skillDB.`)
                    // add skill to menu using skillDB menustring and skillConfig starting level:
                    state.skills[skillDB[skillDef].menuString] = skillConfig.starting.level
                    RPGmechsLog(`Added '${skillDB[skillDef].menuString}' to skills menu.`)
                    continue sheetSkillLoop
                }
            }
            RPGmechsLog(`ERROR: Couldn't find fitting skill definition for '${curSkillID}' in skillDB!`)
        }

    state.skillPoints = skillConfig.starting.points
    state.disableRandomSkill = skillConfig.forbidRandom

    // END vanilla menu initializations.


    // state.RPGstate.charSheet.feats = ['jolly']

    state.RPGstate.init = true // so it knows it's been initialized
}

// iterate over stats, raise costs:
if (statConfig.raise) {
    // RPGmechsLog(`Found stat cost raising in statConfig.`)
    for (let stat in state.stats.stats) {
        // RPGmechsLog(`Raising stat costs: Checking level of '${stat}'.`)
        for (let curRaise of statConfig.raise) {
            // RPGmechsLog(`Raising stat costs: Checking level '${curRaise.threshold}' raise.`)
            if (state.stats.stats[stat].level >= curRaise.threshold) {
                // RPGmechsLog(`'${stat}' level (${state.stats.stats[stat].level}) at or over ${curRaise.threshold} threshold, setting cost to ${curRaise.newCost}`)
                state.stats.stats[stat]["cost"] = 2
            } else {
                // RPGmechsLog(`Raising stat costs: Level of '${stat}' below threshold.`)
            }
        }
    }
}

// backswap ... may be redundant, but better safe than sorry:
state.RPGstate = RPGstate


// Utility functions:
function makeModString(int) { // makes neat modifier strings with adaptive +/- depending on given value
    if (Number.isInteger(int)) {
        if (int >= 0) {
            string = "+" + int
        } else {
            string = "-" + Math.abs(int)
        }
    } else {
        string = ""
    }
    return (string)
}

function inputTypeCheck(inputText) {
    let doTriggered = inputText.match(/> You /gi)
    let sayTriggered = inputText.match(/> You (say|ask)/gi)
    let greaterTriggered = inputText.match(/> /gi)

    if (sayTriggered) {
        RPGmechsLog("'> You say' in input - [say] triggered!")
        return (`say`)
    } else if (doTriggered) {
        RPGmechsLog("'> You' in input - [do] triggered!")
        return (`do`)
    } else if (greaterTriggered) {
        RPGmechsLog("'>' in input - [>story] triggered!")
        return (`greater`)
    } else {
        RPGmechsLog("No '>' or '> You' in input - [story] triggered!")
        return (`story`)
    }
}

function RPGmechsLog(msg) {
    if (miscConfig.doLog) {
        console.log(msg)
        if (miscConfig.hardLog) {
            if (!state.RPGstate.hardLog) {
                state.RPGstate.hardLog = []
            }
            state.RPGstate.hardLog.push(msg)
        }
    }
}

// END RPG mechanic stuff


// misc helper functions:

function capFirstLetter(string) {
    return (string.charAt(0).toUpperCase() + string.slice(1))
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function getRndFromList(list) {
    return (list[getRndInteger(0, list.length)])
}

// displayStats handling:
function displayStatsUpdate([inKey, inValue, inColor]) {
    // if key already exists, update; else push new entry; if no value given, removes displayStat entry matching key, if it exists
    if (!state.displayStats) {
        state.displayStats = []
    }
    let displayStatUpdated = false
    for (let displayStat of state.displayStats) {
        // RPGmechsLog(`Checking '${displayStat.key}' displayStats entry...`)
        let curDisplayStatIndex = state.displayStats.indexOf(displayStat)
        if (displayStat.key === inKey || displayStat.key === '\n' + inKey) {
            RPGmechsLog(`Found '${inKey}' displayStats entry: ${state.displayStats[curDisplayStatIndex].key}, ${state.displayStats[curDisplayStatIndex].value}, ${state.displayStats[curDisplayStatIndex].color}, updating!`)
            if (inValue) {
                if (typeof (inValue) == 'string') {
                    RPGmechsLog(`Value to update displayStat entry inputted: '${inValue}', updating.`)
                    state.displayStats[curDisplayStatIndex].value = inValue
                } else {
                    RPGmechsLog(`Value to update displayStat entry inputted: '${inValue}', updating.`)
                    state.displayStats[curDisplayStatIndex].value = inValue
                }
            } else {
                RPGmechsLog(`No value to update displayStat inputted, removing entry.`)
                state.displayStats.splice(curDisplayStatIndex, 1)
                displayStatUpdated = true
                break
            }
            if (inColor) {
                state.displayStats[curDisplayStatIndex].color = inColor
            }
            displayStatUpdated = true
            break
        }
    }
    if (displayStatUpdated === false && inValue?.length > 0) {
        RPGmechsLog(`No ${inKey} displayStats entry found, adding it!`)
        if (state.displayStats.length > 0) {
            inKey = '\n' + inKey
        }
        if (inColor) {
            state.displayStats.push({'key': inKey, 'value': inValue, 'color': inColor})
        } else {
            state.displayStats.push({'key': inKey, 'value': inValue})
        }
    }
}

// START of placeholder grab thing
// const bracketed = /\[(.*?)\]/g // bracket definition; replace [ ] with symbol of choice - must match smybol used to encapsulate the placeholders in intro prompt!


// grab all bracketed things, put them into array in state
function grabAllBrackets() {
    for (entry of text.match(bracketed)) { // regExing return array, go through each entry in it
        entry = entry.replace(/\[|\]/g, '') // and remove the brackets
        if (!state.placeholders) { // if there isn't an array for this yet
            state.placeholders = [] // make it
        }
        state.placeholders.push(entry) // put the entries into array in state
    }
    console.log(state.placeholders) // to check
}

//grab only one specific bracketed thing, by count; use above function for longterm storage
function grabBracket(index) {
    console.log(text.match(bracketed))
    return (text.match(bracketed)[index].replace(/\[|\]/g, ''))
}

// END of placeholder grab thing