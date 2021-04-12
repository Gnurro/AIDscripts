const modifier = (text) => {
    let modifiedText = text
    const lowered = text.toLowerCase()

    // raising HP by CON:
    if (state.stats.stats['Constitution'].level >= 1) {
        RPGmechsLog(`CON is 1 or higher, raising HP...`)
        let prevHPmatch = true
        if (!state.RPGstate.charSheet.resources.HP.current === state.RPGstate.charSheet.resources.HP.base) {
            RPGmechsLog(`HP not full, will keep old curHP.`)
            prevHPmatch = false
        }
        state.RPGstate.charSheet.resources.HP.base = 3 + state.stats.stats['Constitution'].level
        if (prevHPmatch === true) {
            RPGmechsLog(`HP full, raising curHP as well.`)
            state.RPGstate.charSheet.resources.HP.current = state.RPGstate.charSheet.resources.HP.base
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

    // infobox at the top right:
    if (state.stats.statPoints > 0 || state.skillPoints > 0) { // if there are unspent points...
        displayStatsUpdate(['You have unspent points! Open the menus to the right', '--->', 'red'])
    } else {
        displayStatsUpdate(['You have unspent points! Open the menus to the right'])
    }

    if (miscConfig.showXP) {
        RPGmechsLog(`Trying to show XP: ${state.RPGstate.charSheet.XP}`)
        if (miscConfig.showXPcolor) {
            displayStatsUpdate(['XP', state.RPGstate.charSheet.XP.toString(), miscConfig.showXPcolor])
        } else {
            displayStatsUpdate(['XP', state.RPGstate.charSheet.XP.toString()])
        }
    }

    if (miscConfig.showCharLevel) {
        displayStatsUpdate(['Level', state.RPGstate.charSheet.level.toString()])
    }

    if (miscConfig.showHP) {
        // display fancy HP bar:
        fancyHP:{
            if (miscConfig.showFancyHP) {
                let HPblocks = ''
                RPGmechsLog(`Getting current HP...`)
                var curHP = state.RPGstate.charSheet.resources.HP.current
                for (i = 0; i < state.RPGstate.charSheet.resources.HP.current; i++) {
                    HPblocks += '█'
                }
                let HPcolor = `green`
                if (curHP < state.RPGstate.charSheet.resources.HP.base/2) {
                    HPcolor = `yellow`
                } else if (curHP < state.RPGstate.charSheet.resources.HP.base/3) {
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
        if (miscConfig.showResources) {
            for (let resource in state.RPGstate.charSheet.resources) {
                if (resource !== `HP`) {

                    // fancy resource display:
                    if (miscConfig.showFancyResources) {
                        let resBlocks = ''
                        RPGmechsLog(`Getting current ${resource}...`)
                        curRes = state.RPGstate.charSheet.resources[resource].current
                        for (i = 0; i < curRes; i++) {
                            resBlocks += '█'
                        }
                        resColor = state.RPGstate.charSheet.resources[resource].colors[0]
                        if (curHP < state.RPGstate.charSheet.resources.HP.base / 2) {
                            resColor = state.RPGstate.charSheet.resources[resource].colors[1]
                        } else if (curHP < state.RPGstate.charSheet.resources.HP.base / 3) {
                            resColor = state.RPGstate.charSheet.resources[resource].colors[2]
                        }
                        RPGmechsLog(`Setting ${resource} bar color to ${resColor}`)
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

    // You must return an object with the text property defined.
    return {text: modifiedText}
}

// Don't modify this part
modifier(text)
