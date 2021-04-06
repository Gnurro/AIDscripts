const modifier = (text) => {
    let modifiedText = text
    const lowered = text.toLowerCase()

    // BEGIN RPG mechanics

    // utility stuff:
    let stopInput = false // good to have

    // locking inputBot:
    let stopBot = false

    // const bracketed = /\[(.*?)\]/g


    if (info.actionCount < 1) {
        // clean up the text that goes into history:
        modifiedText = text.replace(/\[|\]/g, '')
    }


    // /r command - this will reset ALL stats and skills!
    if (lowered.includes("/r")) {
        delete state.RPGstate.init // init block will run again
        state.message = "Init reset done."
        stopInput = true // no model call
    }

    // /showDC command
    if (lowered.includes("/showdc")) {
        if (state.RPGstate.showDC === true) {
            state.RPGstate.showDC = false
            state.message = "Turned DC display off."
        }
        if (state.RPGstate.showDC === false) {
            state.RPGstate.showDC = true
            state.message = "Turned DC display on."
        }
        stopInput = true // no model call
    }

    // locking:
    if (statConfig?.locking) {
        for (let trigger of statConfig.locking.lockTriggers) {
            let curRegEx = new RegExp(trigger, 'gi')
            if (modifiedText.match(curRegEx)) {
                RPGmechsLog(`Found '${trigger}' locking trigger, locking inputBot!`)
                stopBot = true
            }
        }
    }

    // skill processing:
    // go through skills menu:
    if (info.actionCount > 0) {
        charSkillLoop:
            for (let skill in state.skills) {

                // get skill modifier from menu:
                let skillMod = state.skills[skill]

                // go through skillDB:
                DBskillLoop:
                    for (let skillDef in skillDB) {

                        // check if currently checked menu skill matches current skillDB skill:
                        if (skillDB[skillDef].menuString === skill) {

                            // go through triggers of matched skill:
                            skillTriggerLoop:
                                for (let triggerStr of skillDB[skillDef].triggers) {

                                    let triggerRegEx = new RegExp(triggerStr, "gi")
                                    let caughtTrigger = text.match(triggerRegEx)

                                    if (caughtTrigger) {
                                        RPGmechsLog(`Caught '${caughtTrigger}' of '${skillDB[skillDef].menuString}'!`)

                                        // check for resource availability:
                                        if (!state.RPGstate.charSheet.resources[skillDB[skillDef].resource].current > 0) {
                                            RPGmechsLog(`Not enough ${skillDB[skillDef].resource} to use skill!`)
                                            continue charSkillLoop
                                        }

                                        // make RPGstate property to grab in contextMod:
                                        if (!state.RPGstate.chkSkillBonus) {
                                            state.RPGstate.chkSkillBonus = 0
                                        }

                                        if (skillMod > state.RPGstate.chkSkillBonus) { // if higher boost...
                                            state.RPGstate.chkSkillBonus = skillMod // ...use it
                                            state.RPGstate.chkSitSkill = skillDB[skillDef]
                                        }

                                        // lower resource used:
                                        state.RPGstate.charSheet.resources[skillDB[skillDef].resource].current -= 1
                                    }
                                }
                        }
                    }
            }
    }

    // resource regen:
    if (info.actionCount > 0) {
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

    if (!stopInput && info.actionCount > 1 && !stopBot) { // if the AI gets used
        state.inputBot = statConfig.inputBot // let the inputBot do her job
    }
    // END RPG mechanics

    return {text: modifiedText, stop: stopInput}
}

// Don't modify this part
modifier(text)
