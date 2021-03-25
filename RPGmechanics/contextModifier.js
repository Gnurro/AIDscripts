const modifier = (text) => {

    // BEGIN rpg mechanics

    // progression:
    // TODO: use generic+safe displayStatsUpdate function!
    if (state.RPGstate.XP >= 100) { // if player got more then 100 XP...
        state.RPGstate.XP -= 100 // ...substract 100 XP,...
        state.stats.statPoints += 1 // ...add a stat point,...
        state.skillPoints += 10 // ...add ten skill points...
        state.displayStats.push({key: '\nLevel up', value: 'Points added!', color: 'yellow'}) // ...and tell the player in the info box.
    }

    // infobox at the top right:
    if (state.stats.statPoints > 0 || state.skillPoints > 0) { // if there are unspent points...
        state.displayStats = [{
            key: 'You have unspent points! Open the menus to the right',
            value: '--->',
            color: 'red'
        }] // ...show people that they have points to spend and POINT AT MENUS
        state.displayStats.push({key: '\nXP', value: state.RPGstate.XP, color: 'green'}) // also show current XP
    } else {
        state.displayStats = [{key: 'XP', value: state.RPGstate.XP, color: 'green'}] // show current XP
    }

    /*
    // reading in stats from menu:
    // TODO: make this work based on statConfig || smarter?
    // TODO: just integrate into check below!
    intMod = state.stats["stats"]["Intelligence"]["level"]
    chaMod = state.stats["stats"]["Charisma"]["level"]
    wisMod = state.stats["stats"]["Wisdom"]["level"]
    strMod = state.stats["stats"]["Strength"]["level"]
    dexMod = state.stats["stats"]["Dexterity"]["level"]
    conMod = state.stats["stats"]["Constitution"]["level"]
    */

    if (info.actionCount > 1 && state.inputBot) {

        // log what the bot came up with:
        RPGmechsLog(info?.inputEvaluation)

        // store bot output:
        let botOutput = info?.inputEvaluation

        // put bot output into handy variables:
        // TODO: this needs to be configurable!
        let chkStat = info?.inputEvaluation[statConfig.botOutputs.stat]
        let chkDC = info?.inputEvaluation[statConfig.botOutputs.dc]
        let chkCuz = info?.inputEvaluation[statConfig.botOutputs.cuz]

        // turn off bot; cleanup
        delete state.inputBot

        // use difficulty to scale XP:
        // TODO: make this a framework option
        let chkXP = chkDC / 5 // DC are divisible by five, so this probably works

        // optional DC display:
        // TODO: make this more configurable; framework options
        if (state.showDC) { // if the display is on (iE, state.showDC == true)...
            state.message = `${miscConfig.messageStatIcon ? statConfig.statList[chkStat].icon : statConfig.statList[chkStat].name} DC${chkDC}: ${chkCuz}` // ...show the attribute, DC and reason in state.message
        } else { // if the display is off (iE, state.showDC == false)...
            state.message = chkCuz // ...show only the reason
        }

        // get check attribute from bot output and assign appropriate attribute modifiers:
        checkBit:
        if (chkStat != null) { // if the bot does come up with anything

            // bot derpness safety:
            // TODO: make this more generic + more useful
            if (chkStat.includes("Any")) { // bot sometimes gives that one; just take it as 'too generic'
                chkStatLvl = 0 // so it gets no attribute bonus
                chkStatPosAdj = "good" // this is the crucial bit for generation, but since the bot said it's generic...
                chkStatNegAdj = "bad" // ...AI is told generic things below
                break checkBit
            }

            // get the corresponding modifier from stat menu:
            chkStatLvl = state.stats.stats[chkStat].level

            // get adjectives from statConfig:
            chkStatPosAdj = statConfig.statList[chkStat.toLowerCase()].successAdjective // this is the crucial bit for generation, but since the bot said it's generic...
            chkStatNegAdj = statConfig.statList[chkStat.toLowerCase()].failAdjective // ...AI is told generic things below

            /*
            if (chkStat.includes("Intelligence")) { // when the bot comes up with an attribute...
                chkStatLvl = intMod // ...assign the appropriate attribute modifier...
                chkStatPosAdj = "smart" // ...and use a fitting positive word...
                chkStatNegAdj = "dumb" // ...or negative word to let the AI know for generation below
            }
            // same as above, for all attributes:
            if (chkStat.includes("Wisdom")) {
                chkStatLvl = wisMod
                chkStatPosAdj = "wise"
                chkStatNegAdj = "oblivious"
            }
            if (chkStat.includes("Charisma")) {
                chkStatLvl = chaMod
                chkStatPosAdj = "charming"
                chkStatNegAdj = "annoying"
            }
            if (chkStat.includes("Strength")) {
                chkStatLvl = strMod
                chkStatPosAdj = "strong"
                chkStatNegAdj = "weak"
            }
            if (chkStat.includes("Dexterity")) {
                chkStatLvl = dexMod
                chkStatPosAdj = "nimble"
                chkStatNegAdj = "clumsy"
            }
            if (chkStat.includes("Constitution")) {
                chkStatLvl = conMod
                chkStatPosAdj = "tough"
                chkStatNegAdj = "scrawny"
            }
            */

            // skill handling:
            if (typeof (state.RPGstate?.chkSkillBonus) !== 'undefined') { // if there's a skill bonus...
                chkSitBonus = chkStatLvl + state.RPGstate.chkSkillBonus // ...add it to the attribute modifier to get the full check modifier

                /*
                // get skill-dependent result strings:
                for (let skillDef in skillDB) {
                    if (skillDef === state.RPGstate.chkSitSkill) {
                        RPGmechsLog("Found skillDef for current skill:" + skillDef)


                        if (skillDB[skillDef].overrideAtt === true) {
                            overrideAtt = true
                            chkSkillPosStr = state.RPGstate.chkSitSkill.results.positive
                            chkSkillNegStr = state.RPGstate.chkSitSkill.results.negative
                        }
                        if (skillDB[skillDef].overrideAtt === false) {
                            overrideAtt = false
                            chkSkillPosStr = skillDB[skillDef].results.positive
                            chkSkillNegStr = skillDB[skillDef].results.negative
                        }
                    }
                }
                */

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
            // TODO: allow other dice!; +different dice for different things: could go into skillDef!
            let roll = getRndInteger(1, 20)

            // add the check modifier to the roll to get the result:
            let chkModRoll = roll + chkSitBonus

            if (chkModRoll >= chkDC) { // if the result beats the DC...

                chkMessageResult = miscConfig.successMessage // ...put the result in words for the player...

                if (typeof (state.RPGstate.chkSitSkill.results.positive) !== 'undefined') {
                    if (state.RPGstate.chkSitSkill.overrideAtt === true) {
                        resultContextString = `[${state.RPGstate.chkSitSkill.results.positive}]` // ...and in words for the AI, as well,...
                    }
                    if (state.RPGstate.chkSitSkill.overrideAtt === false) {
                        resultContextString = `[You are ${chkStatPosAdj} enough for that right now, and ${state.RPGstate.chkSitSkill.results.positive}.]` // ...and in words for the AI, as well,...
                    }
                } else {
                    resultContextString = `[You are ${chkStatPosAdj} enough for that right now.]`
                }
                state.RPGstate.XP += chkXP // ...then add appropriate XP

            } else { // if the result does NOT beat the DC...

                chkMessageResult = miscConfig.failMessage // ...put the result in words for the player...

                if (typeof (state.RPGstate.chkSitSkill.results.negative) !== 'undefined') {
                    if (state.RPGstate.chkSitSkill.overrideAtt === true) {
                        resultContextString = `[${state.RPGstate.chkSitSkill.results.negative}]` // ...and in words for the AI, as well,...
                    }
                    if (state.RPGstate.chkSitSkill.overrideAtt === false) {
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
            state.displayStats = [{key: 'XP', value: state.RPGstate.XP, color: 'green'}]

            // display the full line at the bottom:
            if (info.actionCount >= 2) { // but only if it's useful and possible
                state.message += ` ${chkStat} roll: ${chkModRoll} (${roll}${makeModString(chkStatLvl)}${makeModString(state.RPGstate.chkSkillBonus)}), ${chkMessageResult} XP gained: ${chkXP}` // add all the check stuff to the message
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
