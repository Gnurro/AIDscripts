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

    // /r command - this will reset ALL stats and skills!
    if (lowered.includes("/r")) {
        delete state.RPGstate.init // init block will run again
        state.message = "Init reset done."
        stopInput = true // no model call
    }

    // /showDC command
    if (lowered.includes("/showdc")) {
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
            for (let trigger of statConfig.locking.lockTriggers) {
                let curRegEx = new RegExp(trigger, 'gi')
                if (modifiedText.match(curRegEx)) {
                    RPGmechsLog(`Found '${trigger}' locking trigger, locking inputBot!`)
                    stopBot = true
                }
            }
        }

        // activity processing:
        for (let activity in activityDB) {
            activityTriggerLoop:
                for (let trigger of activityDB[activity].triggers) {
                    let curRegEx = new RegExp(trigger, 'gi')
                    if (modifiedText.match(curRegEx)) {
                        RPGmechsLog(`Found '${trigger}' activity trigger!`)
                        RPGmechsLog(activityDB[activity].logMessage)

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

                        skillActivitiesBlock: {
                            // skillActivities:
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

                        break activityTriggerLoop // one trigger is enough!
                    }
                }
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
                                        RPGmechsLog(`Caught '${caughtTrigger}' of '${skillDB[skillDef].menuString}'!`)

                                        // check for resource dependency:
                                        if (skillDB[skillDef].resource) {
                                            RPGmechsLog(`Skill '${skillDef}' uses '${skillDB[skillDef].resource}', checking availability.`)
                                            // check for resource availability:
                                            if (!state.RPGstate.charSheet.resources[skillDB[skillDef].resource].current > 0) {
                                                RPGmechsLog(`Not enough ${skillDB[skillDef].resource} to use skill!`)
                                                continue charSkillLoop
                                            } else {
                                                RPGmechsLog(`Got enough ${skillDB[skillDef].resource} to use skill!`)
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

    // resource regen:
    if (info.actionCount > 0 && state.RPGstate.miscConfig.inputRegen) {
        resourceRegeneration()
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
