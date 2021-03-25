// BEGIN RPG mechanic stuff


// base init stuff:
if (!state.RPGstate) {
    state.RPGstate = {}
}

RPGstate = state.RPGstate

if(!RPGstate?.showDC) {
    RPGstate.showDC = true
}

if(!RPGstate?.doLog) {
    RPGstate.doLog = true
}

// generic character sheet initializer:
if (!RPGstate?.charSheet) {
    RPGstate.charSheet = {
        name: "",
        class: "",
        skills:[],
        // specific:
        petType: "",
        petName: ""
    }
}


// grab character info from placeholders:
if (info.actionCount < 1) {
    // TODO: make this frameworky
    // TODO: make object format for this; should be easy to set up!

    // the following needs to be set up fitting the intro prompt
    // unmatched placeholders WILL produce errors!

    charSheet = RPGstate.charSheet

    charSheet.name = grabBracket(0)
    charSheet.class = grabBracket(1)
    // specific:
    charSheet.petType = grabBracket(2)
    charSheet.petName = grabBracket(3)

    RPGmechsLog(`Taken from intro prompt:`)
    RPGmechsLog(charSheet)

    modifiedText = text.replace(/\[|\]/g, '') // clean up the text that goes into history

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
if (!state.RPGstate.init) { // but only if they aren't, yet

    // initialize stats menu as defined in statSet:
    // TODO: make this a function thing that dynamically builds the state.stats object
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

    // initialize skills menu according to charSheet:
    // TODO: make this a function thing that dynamically builds the state.skills object
    state.skills = {} // state.skills enables the skills menu; class skills object must fit with it!; definitions above
    for (let curSkillID of charSheet.skills) {
        RPGmechsLog("current ID checked: " + curSkillID)
        for (let skillDef in skillDB) {
            RPGmechsLog("current skillDB skilldef: " + skillDef)
            if (skillDef === curSkillID) {
                RPGmechsLog(skillDB[skillDef].menuString)
                state.skills[skillDB[skillDef].menuString] = 0
            }
        }
    }
    state.skillPoints = 10
    state.disableRandomSkill = true

    // specific:

    state.RPGstate.XP = 0

    // state.RPGstate.charSheet.feats = ['flatchest']

    state.init = true // so it knows it's been initialized
}

// iterate over stats, raise costs if 4 or over:
for (att in state.stats["stats"]) {
    if (state.stats["stats"][att]["level"] >= 4) {
        RPGmechsLog(att + " over 3, setting cost to 2")
        state.stats["stats"][att]["cost"] = 2
    }
}

// stats + bot setup:
const statSet = {
    // the inputBot that is used for general actions:
    inputBot: "BIGinputDCattributeBot5",
    // the stats/attributes it can output:
    statList: {
        intelligence: {
            name: "Intelligence",
            tag: "INT",
            icon: "🧠"
        },
        wisdom: {
            name: "Wisdom",
            tag: "WIS",
            icon: "🤔"
        },
        charisma: {
            name: "Charisma",
            tag: "CHA",
            icon: "😎"
        },
        strength: {
            name: "Strength",
            tag: "STR",
            icon: "💪"
        },
        dexterity: {
            name: "Dexterity",
            tag: "DEX",
            icon: "💃"
        },
        constitution: {
            name: "Constitution",
            tag: "CON",
            icon: "😣"
        },
    }
}

// classes:
const classDB = {
    // "character classes"/skillsets:

    // witch:
    witch: {skills: ['cackle', 'potBrew', 'dance', 'petHandle'],},

    // barbarian:
    barbarian: {skills: ['rockThrow', 'rage', 'intimidate', 'heavyLift'],},

    // kobold:
    kobold: {skills: ['buildTraps', 'hide', 'dragon', 'mining'],},
}

// skills:
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
        triggers: ["\\brag(e|ing(ly)*)",], // to be regEx'd
        overrideAtt: false, // if this skills result strings override the att string
        results: {
            positive: ["do it brutally well in your rage"],
            negative: ["mess it up in your fury"]
        }
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
        // TODO: make stuff like this frameworky!
        menuString: state.petString.charAt(0).toUpperCase() + state.petString.slice(1) + " Handling",
        triggers: [`\\b${state.petString}(?<=your)`, `\\b${state.petName}`], // to be regEx'd
        overrideAtt: true, // if this skills result strings override the att string
        results: {
            positive: [`You have great rapport with your ${state.petString}.`],
            negative: [`Your ${state.petString} doesn't follow your commands!`]
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
        triggers: ["\\bcackl(e|ing)"] // to be regEx'd
    }
}

// Feats!
// Stuff that does context notes independent of skill use or checks and prolly sth for checks as well
const featDB = {}

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
    if (state.RPGstate.doLog) {
        console.log(msg)
    }
}


// END RPG mechanic stuff


// misc helper functions:
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function getRndFromList(list) {
    return (list[getRndInteger(0, list.length)])
}

// START of placeholder grab thing
const bracketed = /\[(.*?)\]/g // bracket definition; replace [ ] with symbol of choice - must match smybol used to encapsulate the placeholders in intro prompt!

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
    return (text.match(bracketed)[index].replace(/\[|\]/g, ''))
}

// END of placeholder grab thing