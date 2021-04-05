const modifier = (text) => {
    let modifiedText = text
    const lowered = text.toLowerCase()

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
