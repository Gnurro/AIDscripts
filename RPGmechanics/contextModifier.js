const modifier = (text) => {

    // BEGIN rpg mechanics

    // progression:
    if (state.RPGstate.charSheet.XP >= state.RPGstate.miscConfig.XPcap) { // if player got more then 100 XP...
        state.RPGstate.charSheet.XP -= state.RPGstate.miscConfig.XPcap // ...substract 100 XP,...
        state.RPGstate.charSheet.level += 1
        state.stats.statPoints += state.RPGstate.miscConfig.levelUpStatPoints // ...add configured stat point(s),...
        state.skillPoints += state.RPGstate.miscConfig.levelUpSkillPoints // ...add configured skill point(s)...
        displayStatsUpdate(['Level up', 'Points added!', 'yellow']) // ...and tell the player in the info box.
    } else {
        // remove the level up message:
        displayStatsUpdate(['Level up', ''])
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

        RPGmechsLog(`DCbot derp: ${chkStat}, ${statConfig.statList[chkStat]}.`)

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
        if (state.RPGstate.miscConfig.showDC) { // if the display is on (iE, state.showDC == true)...
            state.message = `${state.RPGstate.miscConfig.messageStatIcon ? statConfig.statList[chkStat.toLowerCase()].icon : statConfig.statList[chkStat.toLowerCase()].name} DC${chkDC}: ${chkCuz}` // ...show the attribute, DC and reason in state.message
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

                // the actual check:
                // TODO: make most of this configurable!

                // pretend to 'roll a twenty-sided die':
                // TODO: different dice for different things: could go into skillDef!
                let roll = getRndInteger(statConfig.rolling.checkRollRange[0], statConfig.rolling.checkRollRange[1])

                // add the check modifier to the roll to get the result:
                let chkModRoll = roll + chkSitBonus

                if (chkModRoll >= chkDC && !state.RPGstate.actSkillFail) { // if the result beats the DC and there is no skillActivity auto-fail...

                    chkMessageResult = state.RPGstate.miscConfig.successMessage // ...put the result in words for the player...

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
                    state.RPGstate.charSheet.XP += chkXP // ...then add appropriate XP

                } else { // if the result does NOT beat the DC or there is a skillActivity auto-fail...

                    chkMessageResult = state.RPGstate.miscConfig.failMessage // ...put the result in words for the player...

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
                        chkXP = Math.floor(chkXP / 2) // ...by rounding down after halving...
                    }
                    state.RPGstate.charSheet.XP += chkXP // ...then add appropriate XP

                    // skillActivity auto-fail cleanup:
                    if (typeof(state.RPGstate.actSkillFail) !== 'undefined') {
                        delete state.RPGstate.actSkillFail
                    }
                }

                /*

                // update XP display:
                if (state.RPGstate.miscConfig.showXP) {
                    RPGmechsLog(`Trying to show XP: ${state.RPGstate.charSheet.XP}`)
                    if (state.RPGstate.miscConfig.showXPcolor) {
                        displayStatsUpdate(['XP', state.RPGstate.charSheet.XP.toString(), state.RPGstate.miscConfig.showXPcolor])
                    } else {
                        displayStatsUpdate(['XP', state.RPGstate.charSheet.XP.toString()])
                    }
                }

                 */

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
