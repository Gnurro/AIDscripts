# Encounters Framework (Beta 6)
A framework to set up game-y things in AID scenarios without the hassle of having to do in-depth scripting.  
Feel free to fork and improve! I'll also try to keep an eye on the Issues tracker.

## Core Functionality
There can only be one 'current encounter' at a time, and as long as it is defined in state - iE (state.currentEncounter) == true/non-null/!'undefined' - other encounters can not start. Chaining allows to specify follow-up encounters, and branches allow conditional chaining or ending of the current encounter while it is active. 

## Encounter Definitions
An encounter definition, or encounterDef for short, is a JSON object that defines the behaviour of an encounter. The encounterDB object contains the encounterDefs.  
Encounter definitions can be added using Wolrd Info entries: The keys of such an entry must contain '!encounterDef', and the entry text must be a correct JSON object containing encounterDef keys.

### Currently available encounterDef keys:
#### encounterID
**Format:** encounterID:STRING  
**This key *must* have a string value, otherwise things *will* break! This is the only hardcoded, absolutely neccessary key:value for encounterDefs.**  
This is used to keep track of the current encounter and for recurrence, cooldowns, chaining and branching.
#### Starting Encounters:
#### globalActionDelay
**Format:** globalActionDelay:INTEGER  
This keeps the encounter from being considered before the adventure has at least a specified total number of actions. globalActionDelay:1 prevents the encounter from starting on the intro prompt.
#### inputLock
**Format:** inputLock:BOOL  
If set to *true*, stops the encounter from being considered on input actions. This also *applies to endTriggers and branching*!
#### outputLock
**Format:** outputLock:BOOL  
If set to *true*, stops the encounter from being considered on output actions. This also *applies to endTriggers and branching*!
#### triggers
**Format:** triggers:ARRAY; ARRAY = \[STRING, STRING, ...\]  
This is a list of words to check (text) for. If any of them are found in (text), the encounter will be set as current encounter *if chance allows*. List items are turned into regular expressions to check, and thus can utilize full JS regEx syntax. Note: Some regEx special characters, like \b, might need to be double-escaped, like so: \\b
#### chance
**Format:** chance:INTEGER; INTEGER = 0-100  
Percentage chance of this encounter starting. Will be checked either if encounter has no triggers, or if triggers have been found in (text). Set chance:100 to make triggers always work. If chance is not set at all (by omitting it from the encounterDef), the encounter simply can not start on its own and needs to be chained.
#### triggerDelay
**Format:** triggerDelay:INTEGER  
Once the encounter is set as current encounter, it will take this number of actions before it is activated.  
**BETA WARNING: WILL MOST LIKELY CHANGE KEY STRING TO 'activationDelay' FOR CLARITY IN NEXT VERSIONS!** This will help with clarifying the small distinction between setting an encounter as current, and activating it.
#### Encounter Effects:
#### textNotes
**Format:** textNotes:ARRAY; ARRAY = \[STRING, STRING, ...\]  
A list of phrases or words. One phrase will be randomly chosen, if there are multiple. The chosen phrase will be added to the end of (text) once when the encounter activates. Phrases can contain {placeholders}, which will be filled with a random word/phrase from the encounterWordLists object (see below for {placeholder}/random word list info).
#### textNotesWeighted
**Format:** textNotesWeighted:ARRAY; ARRAY = \[\[STRING, INT\], \[STRING, INT\], ...\], INT = 0-100  
For weighted lists, a function basically rolls a d100 and picks the first list item that fits. See shared.js, example encounterDef 'dance' for usage. Note: If there is also textNotes, textNotesWeighted will be ignored!
#### contextNotes
**Format:** contextNotes:ARRAY; ARRAY = \[STRING, STRING, ...\]  
A list of phrases or words. One phrase will be randomly chosen, if there are multiple. The chosen phrase will be shown to the AI right below AN as long as the encounter is active. ~~Phrases can contain {placeholders}, which will be filled with a random word/phrase from the encounterWordLists object (not yet implemented in Beta6) (see below for {placeholder}/random word list info)~~.
#### contextNotesWeighted
**Format:** contextNotesWeighted:ARRAY; ARRAY = \[\[STRING, INT\], \[STRING, INT\], ...\], INT = 0-100  
For weighted lists, a function basically rolls a d100 and picks the first list item that fits. See shared.js, example encounterDef 'dance' for usage of weighted lists.  
Note: If there is also contextNotes, contextNotesWeighted will be ignored!
#### messageString
**Format:** messageString:STRING  
Will be shown above the buttons/input field as long as encounter is active.
#### memoryAdd
**Format:** memoryAdd:OBJECT; OBJECT = {memoryText:STRING,memoryLocation:STRING,memoryGreed:BOOL,memoryLingerDuration:INTEGER}  
World Event style memory insert. key:value explanation TBD; see shared.js for example for now.
#### addWI
**Format:** addWI:ARRAY; ARRAY = \[{a valid WI JSON}, {a valid WI JSON}, ...\]  
A list of WI entries to add. *All* entries in the list will be *added to WI* when the encounter activates.
#### Ending Encounters:
#### endTriggers
**Format:** endTriggers:ARRAY; ARRAY = \[STRING, STRING, ...\]  
This is a list of words to check (text) for. If any of the words are found in (text), the encounter will end. List items are turned into regular expressions to check, and thus can utilize full JS regEx syntax. Note: Some regEx special characters, like \b, might need to be double-escaped, like so: \\b  
Note: Encounters can also be ended by branches, see below.
#### duration
**Format:** duration:INTEGER  
How many actions the encounter remains active. If duration is 0, the encounter will immediately end - this can be used to immediately activate chained encounters. ~~If duration is 1, the encounter will also end in the action it was activated, but chained encounters will not activate yet. (Not tested, but intended.)~~ If the encounter has *no duration* (by omitting it from the encounterDef), *it is endless* and needs to be ended by other means, like endTriggers.
#### chained
**Format:** chained:ARRAY; ARRAY = \[encounterID, encounterID, ...\]  
A list of follow-up encounters. IDs in the list must match a defined encounterDef. One follow-up encounter will be randomly chosen and set as the current encounter.
#### chainedWeighted
**Format:** chainedWeighted:ARRAY; ARRAY = \[\[encounterID, INTEGER\], \[encounterID, INTEGER\], ...\], INTEGER 0-100  
A weighted list of follow-up encounters. IDs in the list must each match a defined encounterDef. One follow-up encounter will be randomly chosen and set as the current encounter. Works like any other weighted list in Encounters.
#### Branching:
#### branches
**Format:** branches:ARRAY; ARRAY = \[{a branchDef}, {a branchDef}, ...\]  
Allows dynamic stuff while the encounter is current.
#### branchDef (Note: This isn't a key; just for this explanation)
**Format:** OBJECT; OBJECT = {branchID:STRING, branchTriggers:ARRAY, branchChance:INTEGER, branchTextNotes:ARRAY, branchTextNotesWeighted:ARRAY, branchChained:ARRAY, branchChainedWeighted:ARRAY}  
#### branchDef key:values:
#### branchID
**Format:** branchID:STRING  
A name for this branch. Currently only used for logging.
#### branchTriggers
**Format:** branchTriggers:ARRAY  
Works the same as encounter triggers.
#### branchChance
**Format:** branchChance:INTEGER  
**This chance is neccessary and can not be omitted!** Works the same as encounter chance.
#### branchTextNotes
**Format:** branchTextNotes:ARRAY  
Will be immediately inserted if this branch is activated! Otherwise works the same as encounter textNotes.
#### branchTextNotesWeighted
**Format:** branchTextNotesWeighted:ARRAY  
Will be immediately inserted if this branch is activated! Otherwise works the same as encounter textNotesWeighted.
#### branchChained
**Format:** branchChained:ARRAY  
This will immediately set the chosen encounter as current encounter! Otherwise works the same as encounter chained.  
Note: If the list is *empty*, this will *immediately end* the current encounter and *clear current encounter*!  
Note: If this (and branchChainedWeighted) is omitted, this branch will add its effects (textNotes, for now) and then the remaining branches will be checked.
#### branchChainedWeighted
**Format:** branchChainedWeighted:ARRAY  
This will immediately set the chosen encounter as current encounter! Otherwise works the same as encounter chainedWeighted.  
Note: If this (and branchChained) is omitted, this branch will add its effects (textNotes, for now) and then the remaining branches will be checked.
#### Limiting Encounters:
#### cooldown
**Format:** cooldown:INTEGER  
The encounter will not be considered until the specified amount of actions have passed *after it ends*.
#### recurrenceLimit
**Format:** recurrenceLimit:INTEGER  
Limits how many times the encounter can be set as current encounter.  
Note: Gets set when encounter ends.


### encounterWordLists
Is an object holding arrays of strings to be randomly inserted into {placeholders}. Note: encounterWordLists is not part of encounterDB!  
Keys in encounterWordLists must match the {placeholder} used like so:  
'{color} flowers are my favorite', with encounterWordLists = {color:\["red", "blue", "green", "chartreuse"\]} will result in any of  
'red flowers are my favorite', 'blue flowers are my favorite', 'green flowers are my favorite', 'chartreuse flowers are my favorite'  
{placeholders} can be used in any of the textNotes strings (for now, probably going to add the functionality to all string things). Any number of {placeholders} should work, with any number of different lists in encounterWordLists.


### License blurb
Currently published under MIT license:


Copyright <2021> <J.K.P. Jordan>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
