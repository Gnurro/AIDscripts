const modifier = (text) => {
    let modifiedText = text
    const lowered = text.toLowerCase()

    // raising HP by specified stat:
    if (state.stats.stats[state.RPGstate.charSheet.resources.HP.stat].level >= 1) {
        RPGmechsLog(`HPADJUST: ${state.RPGstate.charSheet.resources.HP.stat} is 1 or higher, adapting HP...`)
        let prevHPmatch = true
        if (!state.RPGstate.charSheet.resources.HP.current === state.RPGstate.charSheet.resources.HP.base) {
            RPGmechsLog(`HPADJUST: HP not full, will keep old curHP.`)
            prevHPmatch = false
        }
        state.RPGstate.charSheet.resources.HP.base = state.RPGstate.charSheet.resources.HP.initial + state.stats.stats[state.RPGstate.charSheet.resources.HP.stat].level
        if (prevHPmatch === true) {
            RPGmechsLog(`HPADJUST: HP full, raising curHP as well.`)
            state.RPGstate.charSheet.resources.HP.current = state.RPGstate.charSheet.resources.HP.base
        }
    }

    // adjusting resources by specified stats:
    for (let resource in state.RPGstate.charSheet.resources) {
        if (resource !== `HP`) {
            if (!state.RPGstate.charSheet.resources[resource].curStatMod) {
                state.RPGstate.charSheet.resources[resource].curStatMod = state.RPGstate.charSheet.curStats[state.RPGstate.charSheet.resources[resource].stat]
                state.RPGstate.charSheet.resources[resource].base = state.RPGstate.charSheet.resources[resource].initial + state.RPGstate.charSheet.curStats[state.RPGstate.charSheet.resources[resource].stat]
            }

            if (state.RPGstate.charSheet.curStats[state.RPGstate.charSheet.resources[resource].stat] !== state.RPGstate.charSheet.resources[resource].curStatMod) {
                RPGmechsLog(`RESADJUST: ${state.RPGstate.charSheet.resources[resource].stat} has changed, adapting ${resource}...`)
                let prevResMatch = true
                if (state.RPGstate.charSheet.resources[resource].current !== state.RPGstate.charSheet.resources[resource].base) {
                    RPGmechsLog(`RESADJUST: ${resource} not full, will keep old ${resource} amount.`)
                    prevResMatch = false
                }
                state.RPGstate.charSheet.resources[resource].base = state.RPGstate.charSheet.resources[resource].initial + state.RPGstate.charSheet.curStats[state.RPGstate.charSheet.resources[resource].stat]
                if (prevResMatch === true || state.RPGstate.charSheet.resources[resource].current > state.RPGstate.charSheet.resources[resource].base) {
                    RPGmechsLog(`RESADJUST: Current ${resource} full or over base, adjusting current ${resource}.`)
                    state.RPGstate.charSheet.resources[resource].current = state.RPGstate.charSheet.resources[resource].base
                }
            }
        }
    }

    /*

    if (!state.RPGstate.charSheet.resources[`MP`].curStatMod) {
        state.RPGstate.charSheet.resources[`MP`].curStatMod = state.RPGstate.charSheet.curStats[state.RPGstate.charSheet.resources[`MP`].stat]
        state.RPGstate.charSheet.resources[`MP`].base = state.RPGstate.charSheet.resources[`MP`].initial + state.RPGstate.charSheet.curStats[state.RPGstate.charSheet.resources[`MP`].stat]
    }

    if (state.RPGstate.charSheet.curStats[state.RPGstate.charSheet.resources[`MP`].stat] !== state.RPGstate.charSheet.resources[`MP`].curStatMod) {
        RPGmechsLog(`RESADJUST: ${state.RPGstate.charSheet.resources[`MP`].stat} has changed, adapting ${`MP`}...`)
        let prevResMatch = true
        if (!state.RPGstate.charSheet.resources[`MP`].current === state.RPGstate.charSheet.resources[`MP`].base) {
            RPGmechsLog(`RESADJUST: ${`MP`} not full, will keep old ${`MP`} amount.`)
            prevResMatch = false
        }
        state.RPGstate.charSheet.resources[`MP`].base = state.RPGstate.charSheet.resources[`MP`].initial + state.RPGstate.charSheet.curStats[state.RPGstate.charSheet.resources[`MP`].stat]
        if (prevResMatch === true || state.RPGstate.charSheet.resources[`MP`].current > state.RPGstate.charSheet.resources[`MP`].base) {
            RPGmechsLog(`RESADJUST: Current ${`MP`} full or over base, adjusting current ${`MP`}.`)
            state.RPGstate.charSheet.resources[`MP`].current = state.RPGstate.charSheet.resources[`MP`].base
        }
    }

     */

    if (info.actionCount > 0) {

        // activity processing:
        procActivities(true, false, modifiedText)

        // conditions processing:
        if (state.RPGstate.miscConfig.outputConditionsTick) {
            procConditions()
        }

        // resource regen:
        if (state.RPGstate.miscConfig.outputRegen) {
            resourceRegeneration()
        }
    }

    // infobox at the top right:


    if (state.RPGstate.miscConfig.showXP) {
        RPGmechsLog(`Trying to show XP: ${state.RPGstate.charSheet.XP}`)
        if (state.RPGstate.miscConfig.showXPcolor) {
            displayStatsUpdate(['XP', state.RPGstate.charSheet.XP.toString(), state.RPGstate.miscConfig.showXPcolor])
        } else {
            displayStatsUpdate(['XP', state.RPGstate.charSheet.XP.toString()])
        }
    }

    if (state.RPGstate.miscConfig.showCharLevel) {
        displayStatsUpdate(['Level', state.RPGstate.charSheet.level.toString()])
    }

    if (state.RPGstate.miscConfig.showHP) {
        // display fancy HP bar:
        fancyHP:{
            if (state.RPGstate.miscConfig.showFancyHP) {
                let HPblocks = ''
                RPGmechsLog(`Getting current HP...`)
                var curHP = state.RPGstate.charSheet.resources.HP.current
                for (i = 0; i < state.RPGstate.charSheet.resources.HP.current; i++) {
                    HPblocks += '█'
                }
                let HPcolor = `green`
                if (curHP < state.RPGstate.charSheet.resources.HP.base / 2) {
                    HPcolor = `yellow`
                } else if (curHP < state.RPGstate.charSheet.resources.HP.base / 3) {
                    HPcolor = `red`
                }
                displayStatsUpdate(['HP', HPblocks, HPcolor])
            } else {
                displayStatsUpdate(['HP', state.RPGstate.charSheet.resources.HP.current.toString()])
            }
        }
    } else {
        displayStatsUpdate(['HP'])
    }


    resourceDisplay:{
        if (state.RPGstate.miscConfig.showResources) {
            for (let resource in state.RPGstate.charSheet.resources) {
                if (resource !== `HP`) {

                    // fancy resource display:
                    if (state.RPGstate.miscConfig.showFancyResources) {
                        let resBlocks = ''
                        RPGmechsLog(`RESOURCEDISPLAY: Getting current ${resource}...`)
                        curRes = state.RPGstate.charSheet.resources[resource].current
                        for (i = 0; i < curRes; i++) {
                            resBlocks += '█'
                        }
                        resColor = state.RPGstate.charSheet.resources[resource].colors[0]
                        if (curRes < state.RPGstate.charSheet.resources[resource].base / 2) {
                            resColor = state.RPGstate.charSheet.resources[resource].colors[1]
                        } else if (curRes < state.RPGstate.charSheet.resources[resource].base / 3) {
                            resColor = state.RPGstate.charSheet.resources[resource].colors[2]
                        }
                        RPGmechsLog(`RESOURCEDISPLAY: Setting ${resource} bar color to ${resColor}`)
                        displayStatsUpdate([resource, resBlocks, resColor])
                    } else {
                        if (state.RPGstate.charSheet.resources[resource].colors) {
                            displayStatsUpdate([resource, state.RPGstate.charSheet.resources[resource].current, state.RPGstate.charSheet.resources[resource].colors[0]])
                        } else {
                            displayStatsUpdate([resource, state.RPGstate.charSheet.resources[resource].current])
                        }
                    }
                }
            }
        }
    }

    if (state.stats.statPoints > 0 || state.skillPoints > 0) { // if there are unspent points...
        displayStatsUpdate(['You have unspent points! Open the menus to the right', '--->', 'red'])
    } else {
        displayStatsUpdate(['You have unspent points! Open the menus to the right'])
    }

    // You must return an object with the text property defined.
    return {text: modifiedText}
}

// Don't modify this part
modifier(text)
