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
    for (let skill in state.skills) {

        // get skill modifier from menu:
        let skillMod = state.skills[skill]

        // go through skillDB:
        for (let skillDef in skillDB) {

            // check if currently checked menu skill matches current skillDB skill:
            if (skillDB[skillDef].menuString === skill) {

                // go through triggers of matched skill:
                for (let triggerStr of skillDB[skillDef].triggers) {

                    let triggerRegEx = new RegExp(triggerStr, "gi")
                    let caughtTrigger = text.match(triggerRegEx)

                    if (caughtTrigger) {
                        RPGmechsLog(`Caught '${caughtTrigger}' of '${skillDB[skillDef].menuString}'!`)

                        // make RPGstate property to grab in contextMod:
                        if (!state.RPGstate.chkSkillBonus) {
                            state.RPGstate.chkSkillBonus = 0
                        }

                        // TODO: check for resource availability

                        if (skillMod > state.RPGstate.chkSkillBonus) { // if higher boost...
                            state.RPGstate.chkSkillBonus = skillMod // ...use it
                            state.RPGstate.chkSitSkill = skillDB[skillDef]
                        }
                    }
                }
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
