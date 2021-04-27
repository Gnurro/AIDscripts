// BEGIN RPG mechanic stuff

var bracketed = /\[(.*?)\]/g // somehow needs to go here, due to AID scope being super-weird...

// base init stuff:
if (!state.RPGstate) {
    state.RPGstate = {}
}

if (!state.RPGstate?.miscConfig) {
    state.RPGstate.miscConfig = {
        successMessage: `Success!`, // to be shown in the check message
        failMessage: `Fail!`, // to be shown in the check message
        messageStatIcon: true, // should the the check message show the icon of the stat?
        XPdcDivider: 5, // the DC of each check is divided by this number to calculate the base XP gained; DCs are divisible by five (using BIGdcAttributeBot5)
        XPfailFactor: 2, // XP is divided by this number on failed checks (and then rounded down)
        showXP: true,
        showXPcolor: `yellow`, // remove this to use standard theme color
        XPcap: 100, // XP needed for a level up
        showCharLevel: true,
        levelUpStatPoints: 1, // how many stat points are gained each level-up
        levelUpSkillPoints: 10, // how many skill points are gained each level-up
        showDC: true, // visibility of the DC used; set to false for "immersion"
        showHP: true, // set to false to hide HP if unused; INTENDED: if false, also doesn't show fancy HP bar
        showFancyHP: true, // set to false to show number instead of the bar
        showResources: true,
        showFancyResources: true, // set to false to show number instead of the bar
        doLog: true,
        hardLog: false,
        inputRegen: true, // toggle inputs being counted for resource regeneration
        outputRegen: true, // toggle outputs being counted for resource regeneration
        inputConditionsTick: true,  // toggle inputs being counted for condition progression
        outputConditionsTick: true,  // toggle outputs being counted for condition progression
    }
}

// swap for neater code - backswap needed! (or not...? JS is weird...)
RPGstate = state.RPGstate

// MANDATORY generic character sheet initializer:
if (!RPGstate?.charSheet) {
    RPGstate.charSheet = {
        name: "",
        class: "",
        level: 1,
        XP: 0,
        skills: [],
        baseStats: {},
        curStats: {},
        feats: [],
        // resources:
        resources: {
            HP: {
                initial: 3, // starting value
                stat: `Constitution`, // HP get raised by the level of this stat
                base: 3, // 'pool size'/maximum amount; will get adjusted automatically using specified stat
                current: 3,
                regen: 20, // number of actions until one HP is regenerated
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
                stat: `Charisma`, // the base amount will be raised by the level of this stat
                base: 3, // 'pool size'/maximum amount
                current: 3,
                regen: 6, // number of actions to restore one point
                // display bar color; progression possible: from high to low, uses HTML color names (in full lowercase); currently has three levels: more then half, less than half, less than third
                colors: ['royalblue', 'deepskyblue', 'cornflowerblue']
            },
        },
        special: {
            petType: ``,
            petName: ``,
        }
    },
    barbarian: {
        skills: ['rockThrow', 'rage', 'intimidate', 'heavyLift'],
        resources: {
            RAGE: {
                stat: `Constitution`,
                base: 3,
                current: 3,
                regen: 6,
                colors: ['red', 'darkred', 'fireBrick']
            },
        },
    },
    kobold: {
        skills: ['buildTraps', 'hide', 'dragon', 'mining'],
        feats: [`fireProof`],
    },
}

// grab character info from placeholders:
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
const statConfig = {
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
    raiseCost: [
        // threshold is INCLUSIVE, as current level is checked BEFORE raising:
        {threshold: 4, newCost: 2}, // this means going from 4 to 5 costs 2
        {threshold: 9, newCost: 3}, // this means going from 9 to 10 costs 3
    ],
    // OPTIONAL locking inputBot on trivial actions:
    locking: {
        lockTriggers: [`walk`, `breathe`], // will get regEx'd
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

    hide: {
        menuString: "Stealth", // name to be displayed in the skills menu; also the identifier in skills menu processing
        triggers: ["\\bsneak", "\\bhid(e|ing)"], // to be regEx'd
        overrideAtt: false, // if this skills result strings override the att string
        results: {
            positive: ["remain hidden"],
            negative: ["obviously show yourself"]
        }
    },

    dragon: {
        menuString: "Pretending to be a Dragon", // name to be displayed in the skills menu; also the identifier in skills menu processing
        triggers: ["\\bdragon", "(?<your)\\bwings", "\\bdraconic"], // to be regEx'd
        overrideAtt: true, // if this skills result strings override the att string
        results: {
            positive: ["You channel your inner dragon successfully."],
            negative: ["You look like a oversized lizard."]
        }
    },

    mining: {
        menuString: "Mining", // name to be displayed in the skills menu; also the identifier in skills menu processing
        triggers: ["\\b(build(ing)*|creat(ing|e)|dig(ging)*|excavat(e|ing))(?=(mine(s)*|hole(s)*|shaft)"], // to be regEx'd
        overrideAtt: true, // if this skills result strings override the att string
        results: {
            positive: ["You are great at mining this out."],
            negative: ["You mess up the digging."]
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
        overrideAtt: false, // if this skills result strings override the att string - false = the strings get ADDED to the stat result!
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
// Stuff that permanently modifies something
const featDB = {

    jolly: {
        featID: `jolly`,
        infoString: `You are a jolly witch! Your MP regenerates faster, allowing you to effectively cackle more.`,
        resources: {
            MP: {
                regen: 4 // overrides the standard class values
            }
        }
    },

    fireProof: {
        featID: `fireProof`,
        conditions: {
            immuneByTrait: [`fire`] // stop conditions with the `fire` trait from being applied
        }
    }

}

// Activities!
const activityDB = {
    enterFire: {
        activityID: `enterFire`,
        triggers: [`(?<=you.*)(step|walk|stride|move|fall|drop|enter).+(fire|embers|conflagration)(?!.*you)`],
        logMessage: `Detected 'entering fire' activity!`,
        applyConditions: [`onFire`]
    },

    getWet: {
        activityID: `getWet`,
        triggers: [
            `(?<=you.*)(step|walk|stride|move|fall|drop|enter|jump|roll) (in(to)*|through).+(puddle|pond|lake|river|brook|water)(?!.*you)`,
            `starts ((to )*(rain|pour)(ing)*)`,
            `is.*((rain|pour)ing)(?!.*(fire|meteors|death))`
        ],
        logMessage: `Detected 'getting wet' activity!`,
        removeConditions: [`onFire`],
        applyConditions: [`waterSoaked`]
    },

    potionHandle: {
        activityID: `potionHandle`,
        triggers: [`\\bpotion", "\\bbrew(?<=potion)(?=potion)", "\\bvial", "\\balchem(ic(al(y)*)*|y)`],
        logMessage: `Detected 'handling potions' activity!`,
        skillUse: `potBrew`,
        allowUntrained: true,
        untrainedSkillUseMalus: -10
    },

    poisonHandle: {
        activityID: `poisonHandle`,
        triggers: [`\\bpoison", "\\bbrew(?<=poison)(?=poison)", "\\bvial", "\\balchem(ic(al(y)*)*|y)`],
        logMessage: `Detected 'handling poisons' activity!`,
        skillUse: `poisoning`,
        allowUntrained: false
    },

    drinkAlcohol: {
        activityID: `drinkAlcohol`,
        triggers: [`(?<=you.*)(drink|chug|slobber|inbibe|quaff|consume).+(alcohol((ic)* beverage|drink)*|beer|mead|wine|brandy|ale)(?!.*you)`],
        logMessage: `Detected 'drinking alcohol' activity!`,
        applyConditions: [`drunk`],
        stageConditions: [[`drunk`, 1]] // the stage of the specified condition will be changed by the specified amount; negative numbers decrease stage, positive increase; iE drunk(stage 1) will go to drunk(stage 2)
    }
}

// Conditions!
// Stuff that does something to stats, skills, rolls or anything temporarily (even if it sticks for very long times)
const conditionDB = {
    onFire: {
        conditionID: `onFire`,
        traits: [`fire`],
        initialStage: 1,
        stages: [
            {
                resources: {HP: -1, frequency: 3}, // reduce HP by one every three actions
                context: {text: `[You are on fire!]`, position: -3},
                duration: 10, // duration of this stage; without specified next stage, stage will go down by one, in this case ending the condition
            }
        ],
    },
    mageBlightPoison: {
        conditionID: `mageBlightPoison`,
        traits: [`poison`, `magic`, `MP`],
        initialStage: 1,
        stages: [
            {
                resources: {MP: -1, frequency: 4},
                saveRoll: {dc: 15, stat: `Constitution`, frequency: 2, success: 0, fail: 1}, // do a DC15 recovery roll every 2 actions, using constitution stat; if it succeeds, got to stage 0 (which will end this condition), if it fails go to stage 1 (iE stay at this stage)
                context: {text: `[You feel your magic slowly draining from you.]`, position: -3},
                duration: 4,
                followStage: 2, // after duration is over, go to this stage
            },
            {
                resources: {MP: -1, frequency: 2},
                saveRoll: {dc: 20, stat: `Constitution`, frequency: 2, success: 1, fail: 2}, // do a DC20 recovery roll every 2 actions, using constitution stat; if it succeeds, got to stage 1, if it fails go to stage 2 (iE stay at this stage)
                context: [`[Your magic is rapidly draining from you.]`],
                // missing duration will make this stick until otherwise removed
            },
        ],
    },
    drunk: {
        conditionID: `drunk`,
        initialStage: 1,
        stages: [
            {
                stats: {Dexterity: -1, Charisma: +1},
                context: {text: `[You are feeling tipsy.]`}
            },
            {
                stats: {Dexterity: -2},
                context: {text: `[You are drunk.]`}
            },
            {
                stats: {Dexterity: -3, Charisma: -3},
                context: {text: `[You drank way too much.]`}
            },
            {
                replaceCondition: `unconscious` // replace this condition with another one
            }
        ],
    },
    unconscious: {
        conditionID: `unconscious`,
        initialStage: 1,
        stages: [
            {
                stats: {
                    dexterity: `toZero`,
                    charisma: `toZero`,
                    strength: `toZero`,
                    wisdom: `toZero`,
                    intelligence: `toZero`
                },
                context: {text: `[You are unconscious and can not do anything.]`, position: -1},
                skillOverride: true, // if true: override all skill results with context[text]
                statOverride: true // if true: override all stat results with context[text]
            },
        ],
    },
    waterSoaked: {
        conditionID: `waterSoaked`,
    }
}

// initialize menus:
// initialize stats menu:
if (!state.RPGstate.init?.stats) {
    // BEGIN vanilla menu initializations:
    RPGmechsLog(`Initializing stat menu...`)
    // create stats.stats object, add empty menu:
    if (!state.stats) {
        state.stats = {stats: {}}
    }
    // initialize stats menu content as defined in statConfig:
    for (let statID in statConfig.statList) { // go through all the stats in statConfig
        // check if the stat should be in the menu:
        if (!statConfig.statList[statID].ignoreForMenu === true) { // 'if stat is NOT to be IGNORED for menu'
            // add stat to menu using defined 'name':
            state.stats.stats[statConfig.statList[statID].name] = {
                // assign the standard starting values to it:
                level: statConfig.starting.level,
                cost: statConfig.starting.cost
            }
            RPGmechsLog(`Added '${statID}' stat to stats menu as '${statConfig.statList[statID].name}'.`)
        } else {
            RPGmechsLog(`Ignored '${statID}' stat for stats menu adding.`)
        }
    }
    // set starting statpoints:
    state.stats.statPoints = statConfig.starting.points
    // make sure this is only done once (or after resetting):
    if (!state.RPGstate.init) {
        state.RPGstate.init = {}
    }
    state.RPGstate.init.stats = true
}
// initialize skills menu according to charSheet:
if (!state.RPGstate.init?.skills) {
    RPGmechsLog(`Initializing skills menu...`)
    // state.skills enables empty skills menu
    state.skills = {}
    // go through charSheet skills:
    sheetSkillLoop:
        for (let curSkillID of charSheet.skills) { // skill list must contain defined skillIDs!
            RPGmechsLog(`Trying to add '${curSkillID}' skill from character sheet to menu.`)
            // go through skillDB skillDefs to get skill values:
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
    // set starting skill points according to skillConfig:
    state.skillPoints = skillConfig.starting.points
    // disable random skill generation:
    state.disableRandomSkill = skillConfig.forbidRandom // random skills will lack processing and break the script!
    // make sure skills menu is only initialized once (or after reset):
    state.RPGstate.init.skills = true
}
// END vanilla menu initializations.

// TODO: make skill menu update function to allow later addition of skills

// state.RPGstate.charSheet.feats = ['jolly']

// raise stat costs: (might be better in other modifiers?)
raiseStatCosts()

cleanCharSheetStats()

// backswap ... may be redundant, but better safe than sorry:
state.RPGstate = RPGstate

// RPGmx functions:

function cleanCharSheetStats() {
    for (let menuStat in state.stats.stats) {
        if (state.RPGstate.charSheet.baseStats[menuStat] !== state.stats.stats[menuStat].level) {
            RPGmechsLog(`MenuStat/charSheet baseStats mismatch detected, updating charSheet.`)
            state.RPGstate.charSheet.baseStats[menuStat] = state.stats.stats[menuStat].level
        }
        // only do this if no conditions change current stats:
        if (!state.RPGstate.charSheet.conditions) {
            if (state.RPGstate.charSheet.curStats[menuStat] !== state.stats.stats[menuStat].level) {
                RPGmechsLog(`MenuStat/charSheet curStats mismatch without conditions detected, updating charSheet.`)
                state.RPGstate.charSheet.curStats[menuStat] = state.stats.stats[menuStat].level
            }
        }
    }
}


function procConditions() {
    // condition processing

    if (state.RPGstate.charSheet.conditions) {
        RPGmechsLog(`CONDITIONS: Conditions found!`)
        // RPGmechsLog(state.RPGstate.charSheet.conditions)

        currentConditionsLoop:
            for (let condition of state.RPGstate.charSheet.conditions) {
                RPGmechsLog(`CONDITIONS: Character has '${condition.conditionID}' at stage ${condition.curStage}.`)

                activeStageBlock: {

                    // get current stage, base-0 for array handling:
                    if (!condition.activeStage) {
                        condition.activeStage = condition.stages[condition.curStage - 1]
                    }
                    activeStage = condition.activeStage

                    if (activeStage.saveRoll) {
                        if (!activeStage.saveRoll.cd) {
                            // 'roll die' and add specified stat mod:
                            let saveRollValue = getRndInteger(statConfig.rolling.checkRollRange[0], statConfig.rolling.checkRollRange[1]) + state.stats.stats[capFirstLetter(activeStage.saveRoll.stat)].level
                            // check if roll beats the DC:
                            if (saveRollValue >= activeStage.saveRoll.dc) {
                                // check result curStage change:
                                if (activeStage.saveRoll.success !== (condition.stages.indexOf(activeStage) - 1)) {
                                    condition.curStage = activeStage.saveRoll.success
                                    delete condition.activeStage
                                    // if the saveRoll results in a stage change, don't process the rest of this stage:
                                    break activeStageBlock
                                }
                            } else {
                                if (activeStage.saveRoll.fail !== (condition.stages.indexOf(activeStage) - 1)) {
                                    condition.curStage = activeStage.saveRoll.fail
                                    delete condition.activeStage
                                    break activeStageBlock
                                }
                            }
                            // (re)set the cooldown:
                            activeStage.saveRoll.cd = activeStage.saveRoll.frequency
                        } else {
                            activeStage.saveRoll.cd -= 1
                        }
                    }

                    if (activeStage.stats) {
                        if (!state.RPGstate.charSheet.conditionStatMods) {
                            state.RPGstate.charSheet.conditionStatMods = {}
                        }
                        for (let statID in activeStage.stats) {
                            if (!state.RPGstate.charSheet.conditionStatMods[statID]) {
                                state.RPGstate.charSheet.conditionStatMods[statID] = activeStage.stats[statID]
                            } else {
                                state.RPGstate.charSheet.conditionStatMods[statID] += activeStage.stats[statID]
                            }
                        }
                    }

                    if (activeStage.resources) {
                        // check if cooldown does not exist yet or is 0:
                        if (!activeStage.resources.cd) {
                            // apply the effect:
                            for (let resource in state.RPGstate.charSheet.resources) {
                                if (activeStage.resources[resource]) {
                                    state.RPGstate.charSheet.resources[resource] += activeStage.resources[resource]
                                }
                            }
                            // (re)set the cooldown:
                            activeStage.resources.cd = activeStage.resources.frequency
                        } else {
                            activeStage.resources.cd -= 1
                        }
                    }

                    if (activeStage.context) {
                        if (!state.RPGstate.conditionContexts || typeof (state.RPGstate.conditionContexts) === 'undefined') {
                            state.RPGstate.conditionContexts = []
                        }
                        if (!state.RPGstate.conditionContexts.includes(activeStage.context)) {
                            state.RPGstate.conditionContexts.push(activeStage.context)
                        }
                    }

                    if (activeStage.duration) {
                        // curDuration = remaining duration, counts down, not up
                        if (typeof (activeStage.curDuration) === 'undefined') {
                            activeStage.curDuration = activeStage.duration
                        }
                        if (activeStage.curDuration <= 0) {
                            if (activeStage.followStage) {
                                condition.curStage = activeStage.followStage
                                delete condition.activeStage
                                break activeStageBlock
                            } else {
                                condition.curStage -= 1
                                delete condition.activeStage
                                break activeStageBlock
                            }
                        } else {
                            activeStage.curDuration -= 1
                        }
                    }

                    // immediately remove this condition and add a specified other condition:
                    if (activeStage.replaceCondition) {
                        state.RPGstate.charSheet.conditions.splice(state.RPGstate.charSheet.conditions.indexOf(condition), 1)
                        if (!state.RPGstate.charSheet.conditions.includes(activeStage.replaceCondition)) {
                            RPGmechsLog(`CONDITIONS: Character does not have '${activeStage.replaceCondition}' yet, adding it.`)
                            let newCondition = conditionDB[activeStage.replaceCondition]
                            // add curStage value to charSheet condition for tracking of current condition stage:
                            newCondition.curStage = conditionDB[activeStage.replaceCondition].initialStage
                            state.RPGstate.charSheet.conditions.push(newCondition)
                        } else {
                            RPGmechsLog(`CONDITIONS: Character already has '${activeStage.replaceCondition}', not adding it.`)
                        }
                        // go on with further conditions; preventing curStage hiccups:
                        continue currentConditionsLoop
                    }

                    condition.activeStage = activeStage

                }

                // ending conditions when curStage hits 0:
                if (condition.curStage <= 0) {
                    state.RPGstate.charSheet.conditions.splice(state.RPGstate.charSheet.conditions.indexOf(condition), 1)
                } else {
                    // update condition by replacing prior entry (to preserve activeStage values):
                    state.RPGstate.charSheet.conditions.splice(state.RPGstate.charSheet.conditions.indexOf(condition), 1, condition)
                }

            }

        if (state.RPGstate.charSheet.conditionStatMods) {
            // apply all stat modifications:
            for (let statID in state.RPGstate.charSheet.conditionStatMods) {
                state.RPGstate.charSheet.curStats[statID] = state.RPGstate.charSheet.baseStats[statID] + state.RPGstate.charSheet.conditionStatMods[statID]
            }
            // then clean them up to prevent overflow:
            delete state.RPGstate.charSheet.conditionStatMods
        }

        if (state.RPGstate.charSheet.conditions.length === 0) {
            delete state.RPGstate.charSheet.conditions
        }

    } else {
        RPGmechsLog(`CONDITIONS: No active conditions found.`)
    }
}

function procActivities(doConditions, doSkills, curText) {
    // activity processing
    // parameters = bool
    for (let activity in activityDB) {
        activityTriggerLoop:
            for (let trigger of activityDB[activity].triggers) {
                let curRegEx = new RegExp(trigger, 'gi')
                if (curText.match(curRegEx)) {
                    RPGmechsLog(`Found '${trigger}' activity trigger:`)
                    RPGmechsLog(activityDB[activity].logMessage)

                    if (doConditions) {
                        // conditions:
                        conditionsBlock: {
                            if (state.RPGstate.charSheet.conditions) {
                                // removing conditions:
                                if (activityDB[activity]?.removeConditions) {
                                    for (let condition of activityDB[activity].removeConditions) {
                                        state.RPGstate.charSheet.conditions.splice(state.RPGstate.charSheet.conditions.indexOf(condition), 1)
                                    }
                                }

                                // staging conditions:
                                if (activityDB[activity]?.stageConditions) {
                                    for (let conditionStager of activityDB[activity].stageConditions) {
                                        for (let condition of state.RPGstate.charSheet.conditions) {
                                            if (condition.conditionID === conditionStager[0]) {
                                                state.RPGstate.charSheet.conditions[state.RPGstate.charSheet.conditions.indexOf(condition)].curStage += conditionStager[1]
                                            }
                                        }
                                    }
                                }
                            }

                            // applying conditions:
                            if (activityDB[activity]?.applyConditions) {
                                // make sure there is the conditions array in charSheet:
                                if (!state.RPGstate.charSheet.conditions) {
                                    state.RPGstate.charSheet.conditions = []
                                }
                                // add the listed conditions, if char doesn't already have them:
                                for (let condition of activityDB[activity].applyConditions) {
                                    if (!state.RPGstate.charSheet.conditions.includes(condition)) {
                                        RPGmechsLog(`Character does not have '${condition}' yet, adding it.`)
                                        let newCondition = conditionDB[condition]
                                        // add curStage value to charSheet condition for tracking of current condition stage:
                                        newCondition.curStage = conditionDB[condition].initialStage
                                        state.RPGstate.charSheet.conditions.push(newCondition)
                                    } else {
                                        RPGmechsLog(`Character already has '${condition}', not adding it.`)
                                    }
                                }
                            }
                        }
                    }

                    if (doSkills) {
                        // skillActivities:
                        skillActivitiesBlock: {
                            // these are intended to apply to skills THE CHARACTER DOES __NOT__ HAVE!
                            // skills the character does have are handled below
                            if (activityDB[activity]?.skillUse) {
                                // check if the char has that skill:
                                if (!state.RPGstate.charSheet.skills.includes(activityDB[activity].skillUse)) {
                                    RPGmechsLog(`'${activityDB[activity].activityID}' is a skill activity, and the character does not have the '${activityDB[activity].skillUse}' skill.`)
                                    if (skillDB[activityDB[activity].skillUse]) {
                                        state.RPGstate.chkSitSkill = skillDB[activityDB[activity].skillUse]
                                        if (!activityDB[activity].allowUntrained) {
                                            RPGmechsLog(`'${activityDB[activity].activityID}' does not allow untrained skill use.`)
                                            state.RPGstate.actSkillFail = true
                                        } else {
                                            RPGmechsLog(`'${activityDB[activity].activityID}' does allow untrained skill use, applying untrained malus.`)
                                            state.RPGstate.chkSkillBonus = activityDB[activity].untrainedSkillUseMalus
                                        }
                                    } else {
                                        RPGmechsLog(`ERROR: '${activityDB[activity].activityID}' is checking for an undefined skill, '${activityDB[activity].skillUse}'!`)
                                    }
                                }
                            }
                        }
                    }

                    break activityTriggerLoop // one trigger is enough!
                }
            }
    }

}

function raiseStatCosts() {
    if (statConfig.raiseCost) {
        // - NOTE: This can be cheesed by raising a stat beyond the thresholds between actions, as the menu does not allow realtime updates
        // -       can be mitigated by only adding a single statpoint on level ups, but remains an issue for initial char creation
        // RPGmechsLog(`Found stat cost raising in statConfig.`)
        // iterate over stats, raise costs:
        for (let stat in state.stats.stats) {
            // RPGmechsLog(`Raising stat costs: Checking level of '${stat}'.`)
            for (let curRaise of statConfig.raiseCost) {
                // RPGmechsLog(`Raising stat costs: Checking level '${curRaise.threshold}' raise.`)
                if (state.stats.stats[stat].level >= curRaise.threshold) {
                    // RPGmechsLog(`'${stat}' level (${state.stats.stats[stat].level}) at or over ${curRaise.threshold} threshold, setting cost to ${curRaise.newCost}`)
                    state.stats.stats[stat]["cost"] = 2 // TODO: make this configurable
                } else {
                    // RPGmechsLog(`Raising stat costs: Level of '${stat}' below threshold.`)
                }
            }
        }
    } else {
        RPGmechsLog(`Raising stat costs is not enabled.`)
    }
}

function resourceRegeneration() {
    // iterates over resources on charSheet and handles regen timing
    for (let resource in state.RPGstate.charSheet.resources) {
        RPGmechsLog(`Checking ${resource} regeneration...`)
        if (state.RPGstate.charSheet.resources[resource]?.regenCounter) {
            RPGmechsLog(`${resource} regeneration cooldown remaining: ${state.RPGstate.charSheet.resources[resource].regenCounter}`)
        }
        if (state.RPGstate.charSheet.resources[resource].current < state.RPGstate.charSheet.resources[resource].base && !state.RPGstate.charSheet.resources[resource].regenCounter) {
            RPGmechsLog(`Current ${resource} is lower than its base value, starting regeneration countdown.`)
            state.RPGstate.charSheet.resources[resource].regenCounter = state.RPGstate.charSheet.resources[resource].regen
        } else if (state.RPGstate.charSheet.resources[resource].current === state.RPGstate.charSheet.resources[resource].base && state.RPGstate.charSheet.resources[resource].regenCounter) {
            RPGmechsLog(`Current ${resource} is at its base value, removing regeneration countdown.`)
            delete state.RPGstate.charSheet.resources[resource].regenCounter
        }
        if (state.RPGstate.charSheet.resources[resource]?.regenCounter > 0) {
            RPGmechsLog(`${state.RPGstate.charSheet.resources[resource].regenCounter} actions until ${resource} regeneration.`)
            state.RPGstate.charSheet.resources[resource].regenCounter -= 1
        } else if (state.RPGstate.charSheet.resources[resource]?.regenCounter <= 0) {
            RPGmechsLog(`${resource} regeneration cooldown over, adding 1.`)
            state.RPGstate.charSheet.resources[resource].current += 1
        }
    }
}

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

// Utility functions:

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
    if (state.RPGstate.miscConfig.doLog) {
        console.log(msg)
        if (state.RPGstate.miscConfig.hardLog) {
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
        RPGmechsLog(`No displayStats found, creating empty array.`)
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
                    RPGmechsLog(`String value to update displayStat entry inputted: '${inValue}', updating.`)
                    state.displayStats[curDisplayStatIndex].value = inValue
                } else {
                    RPGmechsLog(`Non-string value to update displayStat entry inputted: '${inValue}', updating.`)
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