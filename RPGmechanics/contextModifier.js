const modifier = (text) => {

    // BEGIN rpg mechanics

    // progression:
    if (state.RPGstate.XP >= 100) { // if player got more then 100 XP...
        state.RPGstate.XP -= 100 // ...substract 100 XP,...
        state.stats.statPoints += 1 // ...add a stat point,...
        state.skillPoints += 10 // ...add ten skill points...
        displayStatsUpdate(['Level up', 'Points added!', 'yellow']) // ...and tell the player in the info box.
    } else {
        displayStatsUpdate(['Level up', ''])
    }

    // infobox at the top right:
    if (state.stats.statPoints > 0 || state.skillPoints > 0) { // if there are unspent points...
        displayStatsUpdate(['You have unspent points! Open the menus to the right', '--->', 'red'])
    } else {
        displayStatsUpdate(['You have unspent points! Open the menus to the right'])
    }
    if (miscConfig.showXP) {
        displayStatsUpdate(['XP', state.RPGstate.XP, 'green'])
    }


    if (info.actionCount > 1 && state.inputBot) {

        // log what the bot came up with:
        RPGmechsLog(info?.inputEvaluation)

        // store bot output:
        let botOutput = info?.inputEvaluation

        // put bot output into handy variables:
        // TODO: this needs to be configurable!
        chkStat = info?.inputEvaluation[statConfig.botOutputs.stat]
        chkDC = info?.inputEvaluation[statConfig.botOutputs.dc]
        chkCuz = info?.inputEvaluation[statConfig.botOutputs.cuz]

        if (chkStat == null) {
            chkStat = 'unknown'
        } else if (!typeof(statConfig.statList[chkStat]) === 'undefined') {
            RPGmechsLog(`DCbot got creative and said this is ${chkStat}, but that isn't a configured stat - setting it to 'unknown' for processing.`)
            chkStat = 'unknown'
        }

        if (chkDC == null) {
            chkDC = 0
        }

        // turn off bot; cleanup
        delete state.inputBot

        // use difficulty to scale XP:
        // TODO: make this a framework option
        let chkXP = chkDC / 5 // DC are divisible by five, so this probably works

        // optional DC display:
        // TODO: make this more configurable; framework options
        if (state.RPGstate?.showDC) { // if the display is on (iE, state.showDC == true)...
            state.message = `${miscConfig.messageStatIcon ? statConfig.statList[chkStat.toLowerCase()].icon : statConfig.statList[chkStat.toLowerCase()].name} DC${chkDC}: ${chkCuz}` // ...show the attribute, DC and reason in state.message
        } else { // if the display is off (iE, state.showDC == false)...
            state.message = chkCuz // ...show only the reason
        }

        // get check attribute from bot output and assign appropriate stat modifiers:
        checkBit:
            if (chkStat != null) { // if the bot does come up with anything

                // bot derpness safety:
                // TODO: make this more generic + more useful
                /* Should be handled by 'unknown tracker' above; leaving in for safety for now...
                if (chkStat.includes("Any")) { // bot sometimes gives that one; just take it as 'too generic'
                    chkStatLvl = 0 // so it gets no attribute bonus
                    chkStatPosAdj = "good" // this is the crucial bit for generation, but since the bot said it's generic...
                    chkStatNegAdj = "bad" // ...AI is told generic things below
                    break checkBit
                }
                */

                // get the corresponding modifier from stat menu:
                if (chkStat === 'unknown') {
                    RPGmechsLog(`DCbot came up with 'unknown' stat.`)
                    // chkStatLvl = state.stats.stats[chkStat].level
                    chkStatLvl = 0
                    if (statConfig?.locking?.lockArbitraryChecks === true) {
                        RPGmechsLog(`Stopping check routine due to 'unknown' stat.`)
                        break checkBit
                    }
                } else {
                    RPGmechsLog(`${chkStat} found, setting mod to ${state.stats.stats[chkStat].level}.`)
                    chkStatLvl = state.stats.stats[chkStat].level
                }

                // get adjectives from statConfig:
                chkStatPosAdj = statConfig.statList[chkStat.toLowerCase()].successAdjective // this is the crucial bit for generation, but since the bot said it's generic...
                chkStatNegAdj = statConfig.statList[chkStat.toLowerCase()].failAdjective // ...AI is told generic things below

                // skill handling:
                if (typeof (state.RPGstate?.chkSkillBonus) !== 'undefined') { // if there's a skill bonus...
                    chkSitBonus = chkStatLvl + state.RPGstate.chkSkillBonus // ...add it to the attribute modifier to get the full check modifier
                } else { // if there's no skill bonus...
                    chkSitBonus = chkStatLvl // ...just use the attribute modifier
                }

                // Feats handling:
                /*
                for (feat of state.charFeats) {
                    console.log(feat)
                }
                */


                // the actual check:
                // TODO: make most of this configurable!

                // pretend to 'roll a twenty-sided die':
                // TODO: different dice for different things: could go into skillDef!
                let roll = getRndInteger(statConfig.rolling.checkRollRange[0], statConfig.rolling.checkRollRange[1])

                // add the check modifier to the roll to get the result:
                let chkModRoll = roll + chkSitBonus

                if (chkModRoll >= chkDC) { // if the result beats the DC...

                    chkMessageResult = miscConfig.successMessage // ...put the result in words for the player...

                    // TODO: Add full string customization

                    if (typeof (state.RPGstate?.chkSitSkill?.results?.positive) !== 'undefined') {
                        if (state.RPGstate?.chkSitSkill?.overrideAtt === true) {
                            resultContextString = `[${state.RPGstate.chkSitSkill.results.positive}]` // ...and in words for the AI, as well,...
                        }
                        if (state.RPGstate?.chkSitSkill?.overrideAtt === false) {
                            resultContextString = `[You are ${chkStatPosAdj} enough for that right now, and ${state.RPGstate.chkSitSkill.results.positive}.]` // ...and in words for the AI, as well,...
                        }
                    } else {
                        resultContextString = `[You are ${chkStatPosAdj} enough for that right now.]`
                    }
                    state.RPGstate.XP += chkXP // ...then add appropriate XP

                } else { // if the result does NOT beat the DC...

                    chkMessageResult = miscConfig.failMessage // ...put the result in words for the player...

                    if (typeof (state.RPGstate?.chkSitSkill?.results?.negative) !== 'undefined') {
                        if (state.RPGstate?.chkSitSkill?.overrideAtt === true) {
                            resultContextString = `[${state.RPGstate.chkSitSkill.results.negative}]` // ...and in words for the AI, as well,...
                        }
                        if (state.RPGstate?.chkSitSkill?.overrideAtt === false) {
                            resultContextString = `[You are too ${chkStatNegAdj} for that right now, and ${state.RPGstate.chkSitSkill.results.negative}.]` // ...and in words for the AI, as well,...
                        }
                    } else {
                        resultContextString = `[You are too ${chkStatNegAdj} for that right now.]`
                    }
                    if (chkXP > 1) { // ...make sure to not add half XP...
                        chkXP = Math.floor(chkXP / 2) // ...by rounding up after halving...
                    }
                    state.RPGstate.XP += chkXP // ...then add appropriate XP
                }

                // update XP display:
                displayStatsUpdate(['XP', state.RPGstate.XP, 'green'])

                // display the full line at the bottom:
                if (info.actionCount >= 2) { // but only if it's useful and possible
                    state.message += `${chkStat} roll: ${chkModRoll} (${roll}${makeModString(chkStatLvl)}${makeModString(state.RPGstate.chkSkillBonus)}), ${chkMessageResult} XP gained: ${chkXP}` // add all the check stuff to the message
                }

                // clean up:
                if (typeof (state.RPGstate?.chkSkillBonus) !== 'undefined') { // if there's a skill bonus...
                    delete state.RPGstate.chkSkillBonus // ...get rid of it, so it doesn't go into next check
                    delete state.RPGstate.chkSitSkill
                }
            }

        /*
        for (feat of state.charFeats) {
            console.log(feat)
        }
        */

    }
    // END rpg mechanics

    const contextMemory = info.memoryLength ? text.slice(0, info.memoryLength) : ''
    const context = info.memoryLength ? text.slice(info.memoryLength + 1) : text
    const lines = context.split("\n")

    // BEGIN rpg mechanics
    // THE MAGIC:
    if (typeof (resultContextString) !== 'undefined') { // if there's a result to tell AI...
        lines.splice(-1, 0, resultContextString) // ...put it right below the players input, so AI knows what the check did
        delete resultContextString
    }
    // END rpg mechanics

    const combinedLines = lines.join("\n").slice(-(info.maxChars - info.memoryLength))
    var finalText = [contextMemory, combinedLines].join("")
    return {text: finalText}
}

// Don't modify this part
modifier(text)
