const modifier = (text) => {
    let modifiedText = text
    const lowered = text.toLowerCase()

    // BEGIN Encounters

    // Debugging action counter: (uncomment to better check global timer-only encounters)
    if (encounterSettings.debugMode) {
        displayStatsUpdate(['Actions',`${info.actionCount}`])
    }

    // global encounter consideration
    if (!state.currentEncounter) {
        considerLoop:
            for (let encounter in encounterDB) { // go through encounters
                console.log(`Considering '${encounter}'...`)

                // limiting encounter setting:
                if (encounterDB[encounter].inputLock) {
                    console.log(`Input checking disabled on '${encounter}'.`)
                    continue considerLoop
                }

                //for outputMod:
                /*
                if (encounterDB[encounter].outputLock) {
                  console.log(`Output checking disabled on '${encounter}'.`)
                  continue considerLoop
                }
                */

                if (encounterDB[encounter].recurrenceLimit) {
                    if (state.encounterPersistence.limited) {
                        limitLoop:
                            for (let limiter of state.encounterPersistence.limited) {
                                if (limiter[0] === encounter) {
                                    console.log(`'${encounter}' recurrence has an active limit.`)
                                    if (limiter[1] > 0) {
                                        console.log(`'${limiter[0]}' can still happen ${limiter[1]} times.`)
                                        break limitLoop
                                    } else {
                                        console.log(`'${limiter[0]}' can't happen anymore.`)
                                        continue considerLoop
                                    }
                                }
                            }
                    }
                }

                if (encounterDB[encounter].cooldown) {
                    if (typeof (state.encounterPersistence.cooldowns) !== 'undefined') {
                        for (let cooldown of state.encounterPersistence.cooldowns) {
                            if (cooldown[0] === encounter) {
                                console.log(`'${encounter}' has an active cooldown.`)
                                continue considerLoop
                            }
                        }
                    }
                }

                if (encounterDB[encounter].prerequisite) {
                    console.log(`'${encounterDB[encounter].encounterID}' has prerequisites: ${encounterDB[encounter].prerequisite}`)
                    if (state.encounterPersistence.counts) {
                        prerequisiteLoop:
                            for (let prerequisite of encounterDB[encounter].prerequisite) {
                                console.log(`Looking for '${encounterDB[encounter].encounterID}' prerequisite '${prerequisite[0]}'...`)
                                for (let count of state.encounterPersistence.counts) {
                                    if (count[0] === prerequisite[0]) {
                                        console.log(`Found '${encounterDB[encounter].encounterID}' prerequisite '${prerequisite[0]}', checking count...`)
                                        if (count[1] >= prerequisite[1]) {
                                            console.log(`'${encounterDB[encounter].encounterID}' prerequisite '${prerequisite[0]}' count high enough!`)
                                            continue prerequisiteLoop
                                        } else {
                                            console.log(`'${encounterDB[encounter].encounterID}' prerequisite '${prerequisite[0]}' count too low!`)
                                            continue considerLoop
                                        }
                                    }
                                }
                                console.log(`Couldn't find '${encounterDB[encounter].encounterID}' prerequisite '${prerequisite[0]}'.`)
                                continue considerLoop
                            }
                    } else {
                        console.log(`'${encounterDB[encounter].encounterID}' has prerequisites, but there are no counted occurrences.`)
                        continue considerLoop
                    }
                }

                if (encounterDB[encounter].blockers) {
                    console.log(`'${encounterDB[encounter].encounterID}' has blockers: ${encounterDB[encounter].blockers}`)
                    if (state.encounterPersistence.counts) {
                        for (let blocker of encounterDB[encounter].blockers) {
                            console.log(`Looking for '${encounterDB[encounter].encounterID}' blocker '${blocker[0]}'...`)
                            for (let count of state.encounterPersistence.counts) {
                                if (count[0] === blocker[0]) {
                                    console.log(`Found '${encounterDB[encounter].encounterID}' blocker '${blocker[0]}', checking count...`)
                                    if (count[1] >= blocker[1]) {
                                        console.log(`'${encounterDB[encounter].encounterID}' blocker '${blocker[0]}' count too high!`)
                                        continue considerLoop
                                    } else {
                                        console.log(`'${encounterDB[encounter].encounterID}' blocker '${blocker[0]}' count low enough!`)
                                    }
                                }
                            }
                            console.log(`Couldn't find '${encounterDB[encounter].encounterID}' blocker '${blocker[0]}'.`)
                        }
                    } else {
                        console.log(`'${encounterDB[encounter].encounterID}' not blocked, as there are no counted occurrences.`)
                    }
                }

                if (typeof (encounterDB[encounter].totalActionDelay) == 'undefined') {
                    console.log(`No global delay on '${encounterDB[encounter].encounterID}'!`)
                    totalActionDelay = 0
                } else {
                    totalActionDelay = encounterDB[encounter].totalActionDelay
                }
                if (info.actionCount < totalActionDelay) {
                    console.log(`It's too early for '${encounterDB[encounter].encounterID}'.`)
                    continue considerLoop
                }
                console.log(`Hit more then ${totalActionDelay} total actions, allowing '${encounter}'!`)
                if (encounterDB[encounter].triggers) {
                    console.log(`'${encounterDB[encounter].encounterID}' has triggers!`)
                    triggerLoop:
                        for (let triggerStr of encounterDB[encounter].triggers) {
                            let triggerRegEx = new RegExp(triggerStr, "gi")
                            let caughtTrigger = text.match(triggerRegEx)
                            if (caughtTrigger) {
                                console.log(`Caught '${caughtTrigger}', checking '${encounter}' chance...`)
                                if (!encounterDB[encounter].chance) {
                                    console.log(`No chance on triggered '${encounterDB[encounter].encounterID}' detected, this is probably an error!`)
                                } else {
                                    console.log(`${encounterDB[encounter].chance}% chance detected!`)
                                    if (getRndInteger(1, 100) <= encounterDB[encounter].chance) {
                                        console.log(`Rolled below ${encounterDB[encounter].chance} chance, running '${encounter}'!`)
                                        updateCurrentEncounter(encounter)
                                        break considerLoop
                                    } else {
                                        console.log(`Rolled above ${encounterDB[encounter].chance} chance, so no '${encounter}'!`)
                                    }
                                }
                            }
                        }
                    console.log(`None of the triggers of '${encounterDB[encounter].encounterID}' detected in (text), moving on.`)
                } else {
                    console.log(`No triggers for '${encounter}' found, check chance...`)
                    if (encounterDB[encounter].chance) {
                        console.log(`${encounterDB[encounter].chance}% chance for '${encounter}' detected!`)
                        if (getRndInteger(1, 100) <= encounterDB[encounter].chance) {
                            console.log(`Rolled below ${encounterDB[encounter].chance} chance, running '${encounter}'!`)
                            updateCurrentEncounter(encounter)
                            break considerLoop
                        } else {
                            console.log(`Rolled above ${encounterDB[encounter].chance} chance, so no '${encounter}'!`)
                        }
                    } else {
                        console.log(`No chance on '${encounterDB[encounter].encounterID}' detected, so it's probably a chain-only encounter!`)
                        continue considerLoop
                    }
                }
            }
    }

    // current encounter processing:
    procCurEncounter: {
        if (state.currentEncounter) {

            if (encounterSettings.debugMode) {
                displayStatsUpdate(['Current encounter',`${state.currentEncounter.encounterID}`])
            }

            if (state.currentEncounter.activationDelay) {
                console.log(`Delaying by ${state.currentEncounter.activationDelay} actions before running '${state.currentEncounter.encounterID}'!`)
                state.currentEncounter.activationDelay -= 1
            } else {
                console.log(`No delay, running '${state.currentEncounter.encounterID}'!`)
                // activating encounters:
                updateCurrentEffects()
                if (!state.currentEncounter.memoryAdded && state.currentEncounter.memoryAdd) {
                    if (!state.encounterMemories) {
                        state.encounterMemories = []
                    }
                    state.encounterMemories.push(state.currentEncounter.memoryAdd)
                    state.currentEncounter.memoryAdded = true
                }

                if (!state.currentEncounter.textInserted && state.currentEncounter.textNotes) {
                    let curTextNote = getRndFromList(state.currentEncounter.textNotes)
                    // random wordlist inserts:
                    if (typeof (curTextNote) !== 'undefined') {
                        curTextNote = fillPlaceholders(curTextNote)
                        modifiedText += ` ${curTextNote}`
                        state.currentEncounter.textInserted = true
                    }
                }

                if (!state.currentEncounter.WIadded && state.currentEncounter.addWI) {
                    for (let WIentry in state.currentEncounter.addWI) {
                        console.log(`Adding '${state.currentEncounter.addWI[WIentry].keys}' WI entry.`)
                        addWorldEntry(state.currentEncounter.addWI[WIentry].keys, state.currentEncounter.addWI[WIentry].entry, state.currentEncounter.addWI[WIentry].hidden)
                    }
                    state.currentEncounter.WIadded = true
                }

                // branching encounters:
                // for outputMod:
                // if (state.currentEncounter.branches && !state.currentEncounter.outputLock) {
                if (state.currentEncounter.branches && !state.currentEncounter.inputLock) {
                    branchLoop:
                        for (let chkBranch of state.currentEncounter.branches) {
                            console.log(`Checking '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}'...`)

                            if (!chkBranch.branchChance) {
                                console.log(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no chance, this is most likely an error!`)
                                continue branchLoop
                            }

                            if (chkBranch.branchTriggers) {
                                console.log(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has triggers!`)

                                for (let triggerStr of chkBranch.branchTriggers) {
                                    let triggerRegEx = new RegExp(triggerStr, "gi")
                                    let caughtTrigger = text.match(triggerRegEx)
                                    if (caughtTrigger) {
                                        console.log(`Caught trigger '${caughtTrigger}' for '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}', checking chance...`)
                                        if (getRndInteger(1, 100) <= chkBranch.branchChance) {
                                            console.log(`Rolled below ${chkBranch.branchChance} chance for '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}', branching!`)

                                            if (chkBranch.branchTextNotes) {
                                                let curTextNote = getRndFromList(chkBranch.branchTextNotes)
                                                // random wordlist inserts:
                                                if (typeof (curTextNote) !== 'undefined') {
                                                    curTextNote = fillPlaceholders(curTextNote)
                                                    modifiedText += ` ${curTextNote}`
                                                }
                                            }

                                            if (chkBranch.branchChained) {
                                                updateCurrentEncounter(getRndFromList(chkBranch.branchChained))
                                                break branchLoop
                                            } else {
                                                console.log(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no chained encounter, but this might be intentional.`)
                                            }
                                        }
                                    }
                                }
                            } else {
                                console.log(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no triggers, using pure chance!`)
                                if (getRndInteger(1, 100) <= chkBranch.branchChance) {
                                    console.log(`Rolled below ${chkBranch.branchChance} chance for '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}', branching!`)

                                    if (chkBranch.branchTextNotes) {
                                        let curTextNote = getRndFromList(chkBranch.branchTextNotes)
                                        // random wordlist inserts:
                                        if (typeof (curTextNote) !== 'undefined') {
                                            curTextNote = fillPlaceholders(curTextNote)
                                            modifiedText += ` ${curTextNote}`
                                        }
                                    }

                                    if (chkBranch.branchChained) {
                                        updateCurrentEncounter(getRndFromList(chkBranch.branchChained))
                                        break branchLoop
                                    } else {
                                        console.log(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no chained encounter, but this might be intentional.`)
                                    }
                                }
                            }
                        }
                }

                // ending encounters:
                if (typeof (state.currentEncounter) == 'undefined') {
                    console.log(`state.currentEncounter doesn't exist! This can happen due to branching.`)
                    break procCurEncounter
                } else {
                    if (state.currentEncounter.endTriggers) {
                        console.log(`${state.currentEncounter.encounterID} has end triggers!`)
                        for (let triggerStr of state.currentEncounter.endTriggers) {
                            let triggerRegEx = new RegExp(triggerStr, "gi")
                            let caughtTrigger = text.match(triggerRegEx)
                            if (caughtTrigger) {
                                console.log(`Caught ${caughtTrigger}, ending '${state.currentEncounter.encounterID}'!`)
                                if (state.currentEncounter.chained) {
                                    console.log(`Detected chained encounter(s) on ${state.currentEncounter.encounterID}!`)
                                    delete state.message
                                    delete state.encounterPersistence.contextNote
                                    updateCurrentEncounter(getRndFromList(state.currentEncounter.chained))
                                } else {
                                    updateCurrentEncounter()
                                    updateCurrentEffects()
                                    break procCurEncounter
                                }
                            }
                        }
                    }
                    if (typeof (state.currentEncounter.duration) !== 'undefined') {
                        if (state.currentEncounter.duration > 0) {
                            console.log(`Keeping up ${state.currentEncounter.encounterID} for ${state.currentEncounter.duration} more actions!`)
                            state.currentEncounter.duration -= 1
                        } else {
                            console.log(`Duration of ${state.currentEncounter.encounterID} over!`)
                            if (state.currentEncounter.chained) {
                                console.log(`Detected chained encounter(s) on ${state.currentEncounter.encounterID}!`)
                                delete state.message
                                delete state.encounterPersistence.contextNote
                                updateCurrentEncounter(getRndFromList(state.currentEncounter.chained))
                            } else {
                                updateCurrentEncounter()
                                updateCurrentEffects()
                            }
                        }
                    } else {
                        console.log(`No duration on ${state.currentEncounter.encounterID}, keeping it up infinitely!`)
                    }
                }
            }
        }
    }

    // encounter persistent stuff:
    if (state.encounterPersistence.memories) {
        for (encounterMemory of state.encounterPersistence.memories) {
            if (encounterMemory.memoryLingerDuration >= 1) {
                console.log(`'${encounterMemory.memoryText}' will stay in memory for ${encounterMemory.memoryLingerDuration} more actions.`)
                encounterMemory.memoryLingerDuration -= 1
            } else {
                console.log(`'${encounterMemory.memoryText}' will no longer stay in memory.`)
                state.encounterPersistence.memories.splice(state.encounterPersistence.memories.indexOf(encounterMemory), 1)
                if (encounterSettings.debugMode) {
                    displayStatsUpdate([`"${encounterMemory.memoryText}" memory`])
                }
                continue
            }
            if (encounterSettings.debugMode) {
                displayStatsUpdate([`"${encounterMemory.memoryText}" memory`,`${encounterMemory.memoryLingerDuration} actions remaining`])
            }
        }
    }

    if (state.encounterPersistence.cooldowns) {
        console.log(`Cooldowns detected!`)
        cooldownLoop:
            for (cooldown in state.encounterPersistence.cooldowns) {
                console.log(`'${state.encounterPersistence.cooldowns[cooldown][0]}' [${cooldown}] cooldown: ${state.encounterPersistence.cooldowns[cooldown][1]}.`)
                state.encounterPersistence.cooldowns[cooldown][1] -= 1
                if (state.encounterPersistence.cooldowns[cooldown][1] <= 0) {
                    console.log(`${state.encounterPersistence.cooldowns[cooldown][0]} cooldown over, removing.`)
                    state.encounterPersistence.cooldowns.splice(cooldown, 1)
                    if (encounterSettings.debugMode) {
                        displayStatsUpdate([`'${state.encounterPersistence.cooldowns[cooldown][0]}' cooldown`])
                    }
                    continue cooldownLoop
                }
                if (encounterSettings.debugMode) {
                    displayStatsUpdate([`'${state.encounterPersistence.cooldowns[cooldown][0]}' cooldown`,`${state.encounterPersistence.cooldowns[cooldown][1]} actions remaining`])
                }
            }
        if (state.encounterPersistence.cooldowns[0] == null) {
            console.log(`No more cooldowns, removing array.`)
            delete state.encounterPersistence.cooldowns
        }
    }
    // END Encounters

    return {text: modifiedText}
}

// Don't modify this part
modifier(text)
