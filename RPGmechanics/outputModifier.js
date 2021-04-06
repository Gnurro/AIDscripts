const modifier = (text) => {
    let modifiedText = text
    const lowered = text.toLowerCase()

    // raising HP by CON:
    if (state.stats.stats['Constitution'].level >= 1) {
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
    for (let resource in state.RPGstate.charSheet.resources) {
        RPGmechsLog(`Checking ${resource} regeneration...`)
        if (state.RPGstate.charSheet.resources[resource].current < state.RPGstate.charSheet.resources[resource].base && !state.RPGstate.charSheet.resources[resource].regenCounter) {
            RPGmechsLog(`Current ${resource} is lower than its base value, starting regeneration countdown.`)
            state.RPGstate.charSheet.resources[resource].regenCounter = state.RPGstate.charSheet.resources[resource].regen
        } else if (state.RPGstate.charSheet.resources[resource].current === state.RPGstate.charSheet.resources[resource].base && state.RPGstate.charSheet.resources[resource].regenCounter) {
            RPGmechsLog(`Current ${resource} is at its base value, removing regeneration countdown.`)
            delete state.RPGstate.charSheet.resources[resource].regenCounter
        }
        if (state.RPGstate?.charSheet?.resources[resource]?.regenCounter > 0) {
            RPGmechsLog(`${state.RPGstate.charSheet.resources[resource].regenCounter} actions until ${resource} regeneration.`)
            state.RPGstate.charSheet.resources[resource].regenCounter -= 1
        } else {
            RPGmechsLog(`${resource} regeneration cooldown over, adding 1.`)
            state.RPGstate.charSheet.resources[resource].current += 1
        }
    }

    // display fancy HP bar:
    fancyHP:{
        if (miscConfig.showFancyHP) {
            let HPblocks = ''
            RPGmechsLog(`Getting current HP...`)
            let curHP = state.RPGstate.charSheet.resources.HP.current
            for (i = 0; i < curHP; i++) {
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
            displayStatsUpdate(['HP'])
        }
    }

    resourceDisplay:{
        if (miscConfig.showResources) {
            for (let resource in state.RPGstate.charSheet.resources) {
                if (resource !== `HP`) {
                    let resBlocks = ''
                    RPGmechsLog(`Getting current ${resource}...`)
                    let curRes = state.RPGstate.charSheet.resources[resource].current
                    for (i = 0; i < curRes; i++) {
                        resBlocks += '█'
                    }
                    let resColor = state.RPGstate.charSheet.resources[resource].colors[0]
                    if (curHP < state.RPGstate.charSheet.resources.HP.base / 2) {
                        resColor = state.RPGstate.charSheet.resources[resource].colors[1]
                    } else if (curHP < state.RPGstate.charSheet.resources.HP.base / 3) {
                        resColor = state.RPGstate.charSheet.resources[resource].colors[2]
                    }
                    displayStatsUpdate([resource, resBlocks, resColor])
                }
            }
        }
    }

    // You must return an object with the text property defined.
    return {text: modifiedText}
}

// Don't modify this part
modifier(text)
