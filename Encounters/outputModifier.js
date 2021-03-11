const modifier = (text) => {
    let modifiedText = text
    const lowered = text.toLowerCase()

    // BEGIN Encounters

    // Debugging action counter: (uncomment to better check global timer-only encounters)
    if (encounterSettings.debugMode) {
        displayStatsUpdate(['Actions',`${info.actionCount}`])
    }

    // encounter trigger processing
    if (!state.currentEncounter) {
        globalLoop:
            for (let encounter in encounterDB) { // go through encounters
                encounterLog(`Global checking '${encounter}'...`)
                /*
                if (encounterDB[encounter].inputLock) {
                    encounterLog(`Input checking disabled on '${encounter}'.`)
                    continue globalLoop
                }

                */
                //for outputMod:

                if (encounterDB[encounter].outputLock) {
                  encounterLog(`Output checking disabled on '${encounter}'.`)
                  continue globalLoop
                }

                // limiting encounter recurrence:
                if (state.limitedEncounters) {
                    limitLoop:
                        for (let limiter of state.limitedEncounters) {
                            if (limiter[0] === encounter) {
                                encounterLog(`'${encounter}' recurrence has an active limit.`)
                                if (limiter[1] > 0) {
                                    encounterLog(`'${limiter[0]}' can still happen ${limiter[1]} times.`)
                                    break limitLoop
                                } else {
                                    encounterLog(`'${limiter[0]}' can't happen anymore.`)
                                    continue globalLoop
                                }
                            }
                        }
                }
                if (typeof (state.cooldownEncounters) !== 'undefined') {
                    cooldownLoop:
                        for (let cooldown of state.cooldownEncounters) {
                            if (cooldown[0] === encounter) {
                                encounterLog(`'${encounter}' has an active cooldown.`)
                                continue globalLoop
                            }
                        }
                }
                if (typeof (encounterDB[encounter].totalActionDelay) == 'undefined') {
                    encounterLog(`No global delay on '${encounterDB[encounter].encounterID}'!`)
                    totalActionDelay = 0
                } else {
                    totalActionDelay = encounterDB[encounter].totalActionDelay
                }
                if (info.actionCount < totalActionDelay) {
                    encounterLog(`It's too early for '${encounterDB[encounter].encounterID}'.`)
                    continue globalLoop
                }
                encounterLog(`Hit more then ${totalActionDelay} total actions, allowing '${encounter}'!`)
                if (encounterDB[encounter].triggers) {
                    encounterLog(`'${encounterDB[encounter].encounterID}' has triggers!`)
                    triggerLoop:
                        for (let triggerStr of encounterDB[encounter].triggers) {
                            let triggerRegEx = new RegExp(triggerStr, "gi")
                            let caughtTrigger = text.match(triggerRegEx)
                            if (caughtTrigger) {
                                encounterLog(`Caught '${caughtTrigger}', checking '${encounter}' chance...`)
                                if (!encounterDB[encounter].chance) {
                                    encounterLog(`No chance on triggered '${encounterDB[encounter].encounterID}' detected, this is probably an error!`)
                                } else {
                                    encounterLog(`${encounterDB[encounter].chance}% chance detected!`)
                                    if (getRndInteger(1, 100) <= encounterDB[encounter].chance) {
                                        encounterLog(`Rolled below ${encounterDB[encounter].chance} chance, running '${encounter}'!`)
                                        updateCurrentEncounter(encounter)
                                        break globalLoop
                                    } else {
                                        encounterLog(`Rolled above ${encounterDB[encounter].chance} chance, so no '${encounter}'!`)
                                    }
                                }
                            }
                        }
                    encounterLog(`None of the triggers of '${encounterDB[encounter].encounterID}' detected in (text), moving on.`)
                } else {
                    encounterLog(`No triggers for '${encounter}' found, check chance...`)
                    if (encounterDB[encounter].chance) {
                        encounterLog(`${encounterDB[encounter].chance}% chance for '${encounter}' detected!`)
                        if (getRndInteger(1, 100) <= encounterDB[encounter].chance) {
                            encounterLog(`Rolled below ${encounterDB[encounter].chance} chance, running '${encounter}'!`)
                            updateCurrentEncounter(encounter)
                            break globalLoop
                        } else {
                            encounterLog(`Rolled above ${encounterDB[encounter].chance} chance, so no '${encounter}'!`)
                        }
                    } else {
                        encounterLog(`No chance on '${encounterDB[encounter].encounterID}' detected, so it's probably a chain-only encounter!`)
                        continue globalLoop
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
                encounterLog(`Delaying by ${state.currentEncounter.activationDelay} actions before running '${state.currentEncounter.encounterID}'!`)
                state.currentEncounter.activationDelay -= 1
            } else {
                encounterLog(`No delay, running '${state.currentEncounter.encounterID}'!`)
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
                        encounterLog(`Adding '${state.currentEncounter.addWI[WIentry].keys}' WI entry.`)
                        addWorldEntry(state.currentEncounter.addWI[WIentry].keys, state.currentEncounter.addWI[WIentry].entry, state.currentEncounter.addWI[WIentry].hidden)
                    }
                    state.currentEncounter.WIadded = true
                }

                // branching encounters:
                // for outputMod:
                if (state.currentEncounter.branches && !state.currentEncounter.outputLock) {
                // if (state.currentEncounter.branches && !state.currentEncounter.inputLock) {
                    branchLoop:
                        for (let chkBranch of state.currentEncounter.branches) {
                            encounterLog(`Checking '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}'...`)

                            if (!chkBranch.branchChance) {
                                encounterLog(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no chance, this is most likely an error!`)
                                continue branchLoop
                            }

                            if (chkBranch.branchTriggers) {
                                encounterLog(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has triggers!`)

                                for (let triggerStr of chkBranch.branchTriggers) {
                                    let triggerRegEx = new RegExp(triggerStr, "gi")
                                    let caughtTrigger = text.match(triggerRegEx)
                                    if (caughtTrigger) {
                                        encounterLog(`Caught trigger '${caughtTrigger}' for '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}', checking chance...`)
                                        if (getRndInteger(1, 100) <= chkBranch.branchChance) {
                                            encounterLog(`Rolled below ${chkBranch.branchChance} chance for '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}', branching!`)

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
                                                encounterLog(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no chained encounter, but this might be intentional.`)
                                            }
                                        }
                                    }
                                }
                            } else {
                                encounterLog(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no triggers, using pure chance!`)
                                if (getRndInteger(1, 100) <= chkBranch.branchChance) {
                                    encounterLog(`Rolled below ${chkBranch.branchChance} chance for '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}', branching!`)

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
                                        encounterLog(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no chained encounter, but this might be intentional.`)
                                    }
                                }
                            }
                        }
                }

                // ending encounters:
                if (typeof (state.currentEncounter) == 'undefined') {
                    encounterLog(`state.currentEncounter doesn't exist! This can happen due to branching.`)
                    break procCurEncounter
                } else {
                    if (state.currentEncounter.endTriggers) {
                        encounterLog(`${state.currentEncounter.encounterID} has end triggers!`)
                        for (let triggerStr of state.currentEncounter.endTriggers) {
                            let triggerRegEx = new RegExp(triggerStr, "gi")
                            let caughtTrigger = text.match(triggerRegEx)
                            if (caughtTrigger) {
                                encounterLog(`Caught ${caughtTrigger}, ending '${state.currentEncounter.encounterID}'!`)
                                if (state.currentEncounter.chained) {
                                    encounterLog(`Detected chained encounter(s) on ${state.currentEncounter.encounterID}!`)
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
                            encounterLog(`Keeping up ${state.currentEncounter.encounterID} for ${state.currentEncounter.duration} more actions!`)
                            state.currentEncounter.duration -= 1
                        } else {
                            encounterLog(`Duration of ${state.currentEncounter.encounterID} over!`)
                            if (state.currentEncounter.chained) {
                                encounterLog(`Detected chained encounter(s) on ${state.currentEncounter.encounterID}!`)
                                delete state.message
                                delete state.encounterPersistence.contextNote
                                updateCurrentEncounter(getRndFromList(state.currentEncounter.chained))
                            } else {
                                updateCurrentEncounter()
                                updateCurrentEffects()
                            }
                        }
                    } else {
                        encounterLog(`No duration on ${state.currentEncounter.encounterID}, keeping it up infinitely!`)
                    }
                }
            }
        }
    }

    // encounter memory stuff:
    if (state.encounterPersistence.memories) {
        for (encounterMemory of state.encounterPersistence.memories) {
            if (encounterMemory.memoryLingerDuration >= 1) {
                encounterLog(`'${encounterMemory.memoryText}' will stay in memory for ${encounterMemory.memoryLingerDuration} more actions.`)
                encounterMemory.memoryLingerDuration -= 1
            } else {
                encounterLog(`'${encounterMemory.memoryText}' will no longer stay in memory.`)
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
        encounterLog(`Cooldowns detected!`)
        cooldownLoop:
            for (cooldown in state.encounterPersistence.cooldowns) {
                encounterLog(`'${state.encounterPersistence.cooldowns[cooldown][0]}' [${cooldown}] cooldown: ${state.encounterPersistence.cooldowns[cooldown][1]}.`)
                state.encounterPersistence.cooldowns[cooldown][1] -= 1
                if (state.encounterPersistence.cooldowns[cooldown][1] <= 0) {
                    encounterLog(`${state.encounterPersistence.cooldowns[cooldown][0]} cooldown over, removing.`)
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
            encounterLog(`No more cooldowns, removing array.`)
            delete state.encounterPersistence.cooldowns
        }
    }
    // END Encounters

    return {text: modifiedText}
}

// Don't modify this part
modifier(text)
