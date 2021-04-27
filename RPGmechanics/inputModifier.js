const modifier = (text) => {
    let modifiedText = text
    const lowered = text.toLowerCase()

    // BEGIN RPG mechanics

    // utility stuff:
    let stopInput = false // good to have

    // locking inputBot:
    let stopBot = false

    if (info.actionCount < 1) {
        // clean up the text that goes into history:
        modifiedText = text.replace(/\[|\]/g, '')
    }

    // /reset command - this will reset ALL stats and skills!
    if (text.includes("/RPG reset")) {
        delete state.RPGstate.init // init block will run again
        state.message = "Init reset done."
        stopInput = true // no model call
    }

    // /showDC command
    if (text.includes("/RPG showdc")) {
        if (state.RPGstate.miscConfig.showDC === true) {
            state.RPGstate.miscConfig.showDC = false
            state.message = "Turned DC display off."
        }
        if (state.RPGstate.miscConfig.showDC === false) {
            state.RPGstate.miscConfig.showDC = true
            state.message = "Turned DC display on."
        }
        stopInput = true // no model call
    }

    if (info.actionCount > 0) {

        // locking:
        if (statConfig?.locking) {
            lockTriggerLoop:
            for (let trigger of statConfig.locking.lockTriggers) {
                let curRegEx = new RegExp(trigger, 'gi')
                if (modifiedText.match(curRegEx)) {
                    RPGmechsLog(`LOCKING: Found '${trigger}' locking trigger, locking inputBot!`)
                    stopBot = true
                    break lockTriggerLoop // once triggered is enough!
                }
            }
        }

        // activity processing:
        procActivities(true, true, modifiedText)

        // conditions processing:
        if (state.RPGstate.miscConfig.inputConditionsTick) {
            procConditions()
        }

        // resource regen:
        if (state.RPGstate.miscConfig.inputRegen) {
            resourceRegeneration()
        }

        // skill processing:
        // go through skills menu:
        charSkillLoop:
            // go through each of the skills currently in the skills menu:
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
                                        RPGmechsLog(`SKILLS: Caught '${caughtTrigger}' of '${skillDB[skillDef].menuString}'!`)

                                        // check for resource dependency:
                                        if (skillDB[skillDef].resource) {
                                            RPGmechsLog(`SKILLS: Skill '${skillDef}' uses '${skillDB[skillDef].resource}', checking availability.`)
                                            // check for resource availability:
                                            if (!state.RPGstate.charSheet.resources[skillDB[skillDef].resource].current > 0) {
                                                RPGmechsLog(`SKILLS: Not enough ${skillDB[skillDef].resource} to use skill!`)
                                                continue charSkillLoop
                                            } else {
                                                RPGmechsLog(`SKILLS: Got enough ${skillDB[skillDef].resource} to use skill!`)
                                                // lower resource used:
                                                state.RPGstate.charSheet.resources[skillDB[skillDef].resource].current -= 1
                                            }
                                        }

                                        // make RPGstate property to grab in contextMod:
                                        if (!state.RPGstate.chkSkillBonus) {
                                            state.RPGstate.chkSkillBonus = 0
                                        }

                                        if (skillMod > state.RPGstate.chkSkillBonus) { // if higher boost...
                                            state.RPGstate.chkSkillBonus = skillMod // ...use it
                                            state.RPGstate.chkSitSkill = skillDB[skillDef]
                                        }
                                    }
                                }
                        }
                    }
            }
    }



    // inputBot assignment:
    if (!stopInput && info.actionCount > 1 && !stopBot) { // if the AI gets used
        state.inputBot = statConfig.inputBot // let the inputBot do her job
    }
    // END RPG mechanics

    return {text: modifiedText, stop: stopInput}
}

// Don't modify this part
modifier(text)
