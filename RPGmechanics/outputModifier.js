const modifier = (text) => {
    let modifiedText = text
    const lowered = text.toLowerCase()

    if (state.stats.stats['Constitution'].level >= 1) {
        let prevHPmatch = true
        if (!state.RPGstate.charSheet.curHP === state.RPGstate.charSheet.baseHP) {
            RPGmechsLog(`HP not full, will keep old curHP.`)
            prevHPmatch = false
        }
        state.RPGstate.charSheet.baseHP = 3 + state.stats.stats['Constitution'].level
        if (prevHPmatch === true) {
            RPGmechsLog(`HP full, raising curHP as well.`)
            state.RPGstate.charSheet.curHP = state.RPGstate.charSheet.baseHP
        }
    }

    fancyHP:{
        if (miscConfig.showFancyHP) {
            let HPblocks = ''
            let curHP = state.RPGstate.charSheet.curHP
            for (i = 0; i < state.RPGstate.charSheet.curHP; i++) {
                HPblocks += '█'
            }
            let HPcolor = `green`

            if (curHP < state.RPGstate.charSheet.baseHP/2) {
                HPcolor = `yellow`
            } else if (curHP < state.RPGstate.charSheet.baseHP/3) {
                HPcolor = `red`
            }
            displayStatsUpdate(['HP', HPblocks, HPcolor])
        } else {
            displayStatsUpdate(['HP'])
        }
    }

    // You must return an object with the text property defined.
    return {text: modifiedText}
}

// Don't modify this part
modifier(text)
