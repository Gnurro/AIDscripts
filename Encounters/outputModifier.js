const modifier = (text) => {
  let modifiedText = text
  const lowered = text.toLowerCase()
  
  // BEGIN Encounters
  
  // Debugging action counter: (uncomment to better check global timer-only encounters)
  // state.displayStats = [{key:'Actions', value: `${info.actionCount}`}]
  
  // encounter trigger processing
  if (!state.currentEncounter) {
    globalLoop:
    for (encounter in encounterDB) { // go through encounters
      console.log(`Global checking '${encounter}'...`)
      /*
      if (encounterDB[encounter].inputLock) {
        console.log("Input checking disabled on this encounter.")
        continue globalLoop
      }*/
      //for outputMod:
      
      if (encounterDB[encounter].outputLock) {
        console.log("Output checking disabled on this encounter.")
        continue globalLoop
      }
      
      // limiting encounter recurrence:
      if (state.limitedEncounters) {
        limitLoop:
        for (limiter of state.limitedEncounters) {
          if (limiter[0] == encounter) {
            console.log(`'${encounter}' recurrence has an active limit.`)
            if (limiter[1] > 0) {
              console.log(`'${limiter[0]}' can still happen ${limiter[1]} times.`)
              break limitLoop
            } else {
              console.log(`'${limiter[0]}' can't happen anymore.`)
              continue globalLoop
            }
          }
        }
      }
      if (typeof(state.cooldownEncounters) !== 'undefined') {
        cooldownLoop:
        for (cooldown of state.cooldownEncounters) {
          if (cooldown[0] == encounter) {
            console.log(`'${encounter}' has an active cooldown.`)
            continue globalLoop
          }
        }
      }
      if (typeof(encounterDB[encounter].globalActionDelay) == 'undefined') {
        console.log(`No global delay on '${encounterDB[encounter].encounterID}'!`)
        globalActionDelay = 0
      } else {
        globalActionDelay = encounterDB[encounter].globalActionDelay
      }
      if (info.actionCount < globalActionDelay) {
        console.log(`It's too early for '${encounterDB[encounter].encounterID}'.`)
        continue globalLoop
      }
      console.log(`Hit more then ${globalActionDelay} total actions, allowing '${encounter}'!`)
      if (encounterDB[encounter].triggers) {
        console.log(`'${encounterDB[encounter].encounterID}' has triggers!`)
        triggerLoop:
        for (triggerStr of encounterDB[encounter].triggers) {
          // console.log(triggerStr)
          triggerRegEx = new RegExp(triggerStr, "gi")
          caughtTrigger = text.match(triggerRegEx)
          if (caughtTrigger) {
            console.log(`Caught '${caughtTrigger}', checking '${encounter}' chance...`)
            if (!encounterDB[encounter].chance) {
              console.log(`No chance on triggered '${encounterDB[encounter].encounterID}' detected, this is probably an error!`)
            } else {
              console.log(`${encounterDB[encounter].chance}% chance detected!`)
              if (getRndInteger(1, 100) <= encounterDB[encounter].chance) {
                console.log(`Rolled below ${encounterDB[encounter].chance} chance, running '${encounter}'!`)
                updateCurrentEncounter(encounter)
                break globalLoop
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
            break globalLoop
          } else {
            console.log(`Rolled above ${encounterDB[encounter].chance} chance, so no '${encounter}'!`)
          }
        } else {
          console.log(`No chance on '${encounterDB[encounter].encounterID}' detected, so it's probably a chain-only encounter!`)
          continue globalLoop
        }
      }
    }
  }
        
  // current encounter processing:
  if (state.currentEncounter) {
    if (state.currentEncounter.triggerDelay) {
      console.log(`Delaying by ${state.currentEncounter.triggerDelay} actions before running '${state.currentEncounter.encounterID}'!`)
      state.currentEncounter.triggerDelay -= 1
    } else {
      console.log(`No delay, running '${state.currentEncounter.encounterID}'!`)
      // activating encounters:
      updateCurrentEffects()
      if (!state.currentEncounter.memoryAdded) {
        if (state.currentEncounter.memoryAdd) {
          if (!state.encounterMemories) {
            state.encounterMemories = []
          }
          state.encounterMemories.push(state.currentEncounter.memoryAdd)
          state.currentEncounter.memoryAdded = true
        }
      }
      
      if (!state.currentEncounter.textInserted) {
        if (state.currentEncounter.textNotes) {
          curTextNote = getRndFromList(state.currentEncounter.textNotes)
        } else if (state.currentEncounter.textNotesWeighted) {
          curTextNote = getRndFromListWeighted(state.currentEncounter.textNotesWeighted)
        }
        // random wordlist inserts:
        if (typeof(curTextNote) !== 'undefined') {
          curPlaceholderMatches = curTextNote.match(/\{(.*?)\}/g)
          if (curPlaceholderMatches) {
            //console.log(curPlaceholderMatches)
            for (placeholder of curPlaceholderMatches) {
              //console.log(placeholder)
              for (insertTag in encounterWordLists) {
                if (placeholder.includes(insertTag)) {
                  //console.log(insertTag)
                  pickedInsert = getRndFromList(encounterWordLists[insertTag])
                  //console.log(pickedInsert)
                  insertRegEx = new RegExp(`{${insertTag}}`,)
                  curTextNote = curTextNote.replace(insertRegEx, pickedInsert)
                }
              }  
            }
          // curTextNote = curTextNote.replace(/({|})/gi, '')
        }
        // for outputs:
        modifiedText += ` ${curTextNote}`
        // modifiedText += `\n${curTextNote}`
        state.currentEncounter.textInserted = true
        }
      }
      
      if (!state.currentEncounter.WIadded) {
        if (state.currentEncounter.addWI) {
          for (WIentry in state.currentEncounter.addWI) {
            console.log(`Adding '${state.currentEncounter.addWI[WIentry].keys}' WI entry.`)
            addWorldEntry(state.currentEncounter.addWI[WIentry].keys, state.currentEncounter.addWI[WIentry].entry, state.currentEncounter.addWI[WIentry].hidden)
          }
          state.currentEncounter.WIadded = true
        }
      }
      
      // branching encounters:
      // for outputMod:
      if (state.currentEncounter.branches && !state.currentEncounter.outputLock) {
      // if (state.currentEncounter.branches && !state.currentEncounter.inputLock) {
        branchLoop:
        for (chkBranch of state.currentEncounter.branches) {
          console.log(`Checking '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}'...`)
          
          if (!chkBranch.branchChance) {
            console.log(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no chance, this is most likely an error!`)
            continue branchLoop
          }
          
          if (chkBranch.branchTriggers) {
            console.log(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has triggers!`)
            branchTriggerLoop:
            for (triggerStr of chkBranch.branchTriggers) {
              triggerRegEx = new RegExp(triggerStr, "gi")
              caughtTrigger = text.match(triggerRegEx)
              if (caughtTrigger) {
                console.log(`Caught trigger '${caughtTrigger}' for '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}', checking chance...`)
                if (getRndInteger(1, 100) <= chkBranch.branchChance) {
                  console.log(`Rolled below ${chkBranch.branchChance} chance for '${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}', branching!`)
                  
                  if (chkBranch.branchTextNotes || chkBranch.branchTextNotesWeighted) {
                    if (chkBranch.branchTextNotes) {
                      curTextNote = getRndFromList(chkBranch.branchTextNotes)
                    } else if (chkBranch.branchTextNotesWeighted) {
                      curTextNote = getRndFromListWeighted(chkBranch.branchTextNotesWeighted)
                    }
                    // random wordlist inserts:
                    if (typeof(curTextNote) !== 'undefined') {
                      curPlaceholderMatches = curTextNote.match(/\{(.*?)\}/g)
                      if (curPlaceholderMatches) {
                        //console.log(curPlaceholderMatches)
                        for (placeholder of curPlaceholderMatches) {
                          //console.log(placeholder)
                          for (insertTag in encounterWordLists) {
                            if (placeholder.includes(insertTag)) {
                              //console.log(insertTag)
                              pickedInsert = getRndFromList(encounterWordLists[insertTag])
                              //console.log(pickedInsert)
                              insertRegEx = new RegExp(`{${insertTag}}`,)
                              curTextNote = curTextNote.replace(insertRegEx, pickedInsert)
                            }
                          }  
                        }
                        // curTextNote = curTextNote.replace(/({|})/gi, '')
                      }
                      // for outputs:
                      modifiedText += ` ${curTextNote}`
                      /*
                      if (!modifiedText.match(/\n/)) {
                        modifiedText += `\n${curTextNote}`
                      } else {
                        modifiedText += ` ${curTextNote}`
                      }
                      */
                    }
                  }
                  
                  if (chkBranch.branchChained) {
                    updateCurrentEncounter(getRndFromList(chkBranch.branchChained))
                    break branchLoop
                  } else if (chkBranch.branchChainedWeighted) {
                    updateCurrentEncounter(getRndFromListWeighted(chkBranch.branchChainedWeighted))
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
                modifiedText += ` ${getRndFromList(chkBranch.branchTextNotes)}`
              } else if (chkBranch.branchTextNotesWeighted) {
                modifiedText += ` ${getRndFromListWeighted(chkBranch.branchTextNotesWeighted)}`
              }
              if (chkBranch.branchChained) {
                updateCurrentEncounter(getRndFromList(chkBranch.branchChained))
                break branchLoop
              } else if (chkBranch.branchChainedWeighted) {
                updateCurrentEncounter(getRndFromListWeighted(chkBranch.branchChainedWeighted))
                break branchLoop
              } else {
                console.log(`'${state.currentEncounter.encounterID}' branch '${chkBranch.branchID}' has no chained encounter, but this might be intentional.`)
              }
            }
          }
        }
      }
      
      // ending encounters:
      if (typeof(state.currentEncounter) == 'undefined') {
        console.log(`state.currentEncounter doesn't exist! This can happen due to branching.`)
      } else {
      if (state.currentEncounter.endTriggers) {
        console.log(`${state.currentEncounter.encounterID} has end triggers!`)
        for (triggerStr of state.currentEncounter.endTriggers) {
          triggerRegEx = new RegExp(triggerStr, "gi")
          caughtTrigger = text.match(triggerRegEx)
          if (caughtTrigger) {
            console.log(`Caught ${caughtTrigger}, ending '${state.currentEncounter.encounterID}'!`)
            if (state.currentEncounter.chained || state.currentEncounter.chainedWeighted) {
              console.log(`Detected chained encounter(s) on ${state.currentEncounter.encounterID}!`)
              delete state.message
              delete state.encounterNote
              if (state.currentEncounter.chained) {
                console.log(`Chained encounter(s) on ${state.currentEncounter.encounterID} are not weighted.`)
                updateCurrentEncounter(getRndFromList(state.currentEncounter.chained))
              } else if (state.currentEncounter.chainedWeighted) {
                console.log(`Chained encounters on ${state.currentEncounter.encounterID} are weighted.`)
                updateCurrentEncounter(getRndFromListWeighted(state.currentEncounter.chainedWeighted))
              }
            } else {
              updateCurrentEncounter()
              updateCurrentEffects()
            }
          }
        }
      }
      
      
      if (typeof(state.currentEncounter.duration) !== 'undefined') {
        if (state.currentEncounter.duration > 0) {
          console.log(`Keeping up ${state.currentEncounter.encounterID} for ${state.currentEncounter.duration} more actions!`)
          state.currentEncounter.duration -= 1
        } else {
          console.log(`Duration of ${state.currentEncounter.encounterID} over!`)
          if (state.currentEncounter.chained || state.currentEncounter.chainedWeighted) {
            console.log(`Detected chained encounter(s) on ${state.currentEncounter.encounterID}!`)
            delete state.message
            delete state.encounterNote
            if (state.currentEncounter.chained) {
              console.log(`Chained encounter(s) on ${state.currentEncounter.encounterID} not weighted.`)
              updateCurrentEncounter(getRndFromList(state.currentEncounter.chained))
            } else if (state.currentEncounter.chainedWeighted) {
              console.log(`Chained encounters on ${state.currentEncounter.encounterID} are weighted.`)
              updateCurrentEncounter(getRndFromListWeighted(state.currentEncounter.chainedWeighted))
            }
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
  
  
  
  // encounter memory stuff:
  if (state.encounterMemories) {
    for (encounterMemory of state.encounterMemories) {
      if (encounterMemory.memoryLingerDuration > 0) {
        encounterMemory.memoryLingerDuration -= 1
        console.log(`'${encounterMemory.memoryText}' will stay in memory for ${encounterMemory.memoryLingerDuration} more actions.`)  
      } else {
        delete state.encounterMemories.encounterMemory
      }
    }
  }
  
  if (state.cooldownEncounters) {
    console.log(`Cooldowns detected!`)
    for (cooldown in state.cooldownEncounters) {
      console.log(`'${state.cooldownEncounters[cooldown][0]}' (${cooldown}) cooldown: ${state.cooldownEncounters[cooldown][1]}.`)
      state.cooldownEncounters[cooldown][1] -= 1
      if (state.cooldownEncounters[cooldown][1] < 1) {
        console.log(`${state.cooldownEncounters[cooldown][0]} cooldown over, removing.`)
        delete state.cooldownEncounters[cooldown]
      }
    }
      if (state.cooldownEncounters[0] == null) {
        console.log(`No more cooldowns, removing array.`)
        delete state.cooldownEncounters
      }
    
  }
  // END Encounters
  
  // You must return an object with the text property defined.
  return { text: modifiedText }
}

// Don't modify this part
modifier(text)
