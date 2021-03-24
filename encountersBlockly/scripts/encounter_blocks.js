
Blockly.defineBlocksWithJsonArray([{
  "type": "triggers",
  "message0": "Triggers: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "triggers",
      "check": "trigger"
    }
  ],
  "previousStatement": "condition",
  "nextStatement": "condition",
  "colour": 60,
  "tooltip": "A list of trigger words/phrases, which will be turned into regular expressions.",
  "helpUrl": ""
},
{
  "type": "trigger",
  "message0": "Trigger: %1",
  "args0": [
    {
      "type": "field_input",
      "name": "trigger",
      "text": "..."
    }
  ],
  "previousStatement": "trigger",
  "nextStatement": "trigger",
  "colour": 180,
  "tooltip": "A word/phrase that will be turned into a regular expression to check inputs/outputs for.",
  "helpUrl": ""
},
{
  "type": "encounterdef",
  "message0": "Encounter ID: %1 %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "encounterID",
      "text": "encounterID"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "encounterKeys",
      "check": "encounterKey"
    }
  ],
  "previousStatement": "encounterDef",
  "nextStatement": "encounterDef",
  "colour": 230,
  "tooltip": "Encounter Definition",
  "helpUrl": ""
},
{
  "type": "opener",
  "message0": "Open Encounter: %1 %% chance %2 %3",
  "args0": [
    {
      "type": "field_number",
      "name": "encounterChance",
      "value": 0,
      "min": 1,
      "max": 100
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "conditions",
      "check": "condition"
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 60,
  "tooltip": "Opens the encounter for consideration. This means this encounter can become current 'on its own'.",
  "helpUrl": ""
},
{
  "type": "inputlock",
  "message0": "Lock Input Processing",
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 0,
  "tooltip": "Stops inputs from being checked for encounter branching/ending.",
  "helpUrl": ""
},
{
  "type": "outputlock",
  "message0": "Lock Output Processing",
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 0,
  "tooltip": "Stops outputs from being checked for encounter branching/ending.",
  "helpUrl": ""
},
{
  "type": "prerequisite",
  "message0": "Prerequisite Encounters: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "prereqEncs",
      "check": "encounterCount"
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 60,
  "tooltip": "A list of prerequisite encounters and how often they need to have occurred before this encounter can become current.",
  "helpUrl": ""
},
{
  "type": "encountercount",
  "message0": "%1 occurred %2 times.",
  "args0": [
    {
      "type": "field_input",
      "name": "encounterCountID",
      "text": "encounterID"
    },
    {
      "type": "field_number",
      "name": "encounterCountNumber",
      "value": 0,
      "min": 1
    }
  ],
  "previousStatement": "encounterCount",
  "nextStatement": "encounterCount",
  "colour": 60,
  "tooltip": "To check if this encounterID has occurred this many times.",
  "helpUrl": ""
},
{
  "type": "blockers",
  "message0": "Blocking Encounters: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "blockersEncs",
      "check": "encounterCount"
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 60,
  "tooltip": "A list of encounters and how often they must have occurred to block this encounter from becoming current.",
  "helpUrl": ""
},
{
  "type": "totalactiondelay",
  "message0": "Total Action Delay: %1",
  "args0": [
    {
      "type": "field_number",
      "name": "totalActionDelayNumber",
      "value": 0,
      "min": 1
    }
  ],
  "previousStatement": "condition",
  "nextStatement": "condition",
  "colour": 60,
  "tooltip": "How many actions the running adventure has to have in total to allow for this encounter to  become current.",
  "helpUrl": ""
},
{
  "type": "textnotes",
  "message0": "Text Notes: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "textNotesList",
      "check": [
        "stringNote",
        "stringNoteWeighted"
      ]
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 90,
  "tooltip": "A list of possible text notes to be inserted when the encounter becomes active.",
  "helpUrl": ""
},
{
  "type": "contextnotes",
  "message0": "Context Notes: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "contextNotesList",
      "check": [
        "stringNote",
        "stringNoteWeighted"
      ]
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 90,
  "tooltip": "A list of possible context notes to be inserted into AI context, right below Authors Note.",
  "helpUrl": ""
},
{
  "type": "messagestring",
  "message0": "Message: %1",
  "args0": [
    {
      "type": "field_input",
      "name": "messageStringText",
      "text": "Some info."
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 90,
  "tooltip": "A text string to be displayed at the bottom, above the buttons, while the encounter is active.",
  "helpUrl": ""
},
{
  "type": "addwi",
  "message0": "World Info to add: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "addWIentries",
      "check": "WIentry"
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 90,
  "tooltip": "A list of World Info entries to be added when the encounter becomes active.",
  "helpUrl": ""
},
{
  "type": "wientry",
  "message0": "WI keys: %1 WI entry: %2",
  "args0": [
    {
      "type": "field_input",
      "name": "WIentryKeys",
      "text": "..."
    },
    {
      "type": "field_input",
      "name": "WIentryText",
      "text": "..."
    }
  ],
  "previousStatement": "WIentry",
  "nextStatement": "WIentry",
  "colour": 90,
  "tooltip": "A World Info entry.",
  "helpUrl": ""
},
{
  "type": "activationdelay",
  "message0": "Delay activation by %1",
  "args0": [
    {
      "type": "input_value",
      "name": "activationDelayNumber",
      "check": [
        "actionNumber",
        "rndActionRange"
      ]
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 45,
  "tooltip": "Delays the activation of the encounter by the set amount of actions.",
  "helpUrl": ""
},
{
  "type": "displaynotes",
  "message0": "Display Notes: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "displayNoteList",
      "check": "displayNote"
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 90,
  "tooltip": "A list of notes to be displayed at the top right. The : can't be avoided.",
  "helpUrl": ""
},
{
  "type": "stringnote",
  "message0": "%1",
  "args0": [
    {
      "type": "field_input",
      "name": "stringNoteText",
      "text": "Note Text"
    }
  ],
  "previousStatement": "stringNote",
  "nextStatement": "stringNote",
  "colour": 90,
  "tooltip": "A note text.",
  "helpUrl": ""
},
{
  "type": "stringnoteweighted",
  "message0": "%1 Threshold: %2",
  "args0": [
    {
      "type": "field_input",
      "name": "stringNoteText",
      "text": "Note Text"
    },
    {
      "type": "field_number",
      "name": "stringNoteThreshold",
      "value": 0,
      "min": 1,
      "max": 100
    }
  ],
  "previousStatement": "stringNoteWeighted",
  "nextStatement": "stringNoteWeighted",
  "colour": 90,
  "tooltip": "A note text with a threshold. Threshold must be between 1 and 100.",
  "helpUrl": ""
},
{
  "type": "displaynote",
  "message0": "Display %1 : %2 , colored %3",
  "args0": [
    {
      "type": "field_input",
      "name": "displayNoteKeyText",
      "text": "..."
    },
    {
      "type": "field_input",
      "name": "displayNoteValueText",
      "text": "..."
    },
    {
      "type": "field_colour",
      "name": "displayNoteColor",
      "colour": "#ffffff"
    }
  ],
  "previousStatement": "displayNote",
  "nextStatement": "displayNote",
  "colour": 90,
  "tooltip": "A note to be displayed at the top right. First part is used to identify these notes. The : can't be avoided.",
  "helpUrl": ""
},
{
  "type": "countoccurrence",
  "message0": "Count Encounter Occurrence",
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 270,
  "tooltip": "Enables occurrence counting for this encounter. Needed for prerequisites and blockers.",
  "helpUrl": ""
},
{
  "type": "memoryadd",
  "message0": "Encounter Memory: %1 %2 at the %3 of memory for %4 actions.",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "field_input",
      "name": "memoryText",
      "text": "..."
    },
    {
      "type": "field_dropdown",
      "name": "memoryLocation",
      "options": [
        [
          "bottom",
          "bottom"
        ],
        [
          "top",
          "top"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "memoryLingerDuration",
      "value": 0,
      "min": 1
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 270,
  "tooltip": "Adds a memory of this encounter that persists for some time after the encounter ends.",
  "helpUrl": ""
},
{
  "type": "cooldown",
  "message0": "Do not consider this encounter for the next %1",
  "args0": [
    {
      "type": "input_value",
      "name": "cooldownNumber",
      "check": [
        "actionNumber",
        "rndActionRange"
      ]
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 270,
  "tooltip": "A cooldown, stopping the encounter from becoming current for a set amount of actions after it ends.",
  "helpUrl": ""
},
{
  "type": "duration",
  "message0": "End this encounter after %1",
  "args0": [
    {
      "type": "input_value",
      "name": "durationNumber",
      "check": [
        "rndActionRange",
        "actionNumber"
      ]
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 0,
  "tooltip": "Action-based encounter ending.",
  "helpUrl": ""
},
{
  "type": "endtriggers",
  "message0": "End Triggers: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "endTriggersList",
      "check": "trigger"
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 0,
  "tooltip": "A list of triggers which end the encounter.",
  "helpUrl": ""
},
{
  "type": "chained",
  "message0": "Chained encounters: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "chainedList",
      "check": [
        "encounterLink",
        "encounterLinkThreshold"
      ]
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 270,
  "tooltip": "A list of chained encounters.",
  "helpUrl": ""
},
{
  "type": "encounterlink",
  "message0": "Chain into: %1",
  "args0": [
    {
      "type": "field_input",
      "name": "encounterLinkID",
      "text": "encounterID"
    }
  ],
  "previousStatement": "encounterLink",
  "nextStatement": "encounterLink",
  "colour": 180,
  "tooltip": "A link to an encounter to be chained.",
  "helpUrl": ""
},
{
  "type": "encounterlinkthreshold",
  "message0": "Chain into: %1 Threshold: %2",
  "args0": [
    {
      "type": "field_input",
      "name": "encounterLinkID",
      "text": "encounterID"
    },
    {
      "type": "field_number",
      "name": "encounterLinkThresholdNumber",
      "value": 0,
      "min": 1,
      "max": 100
    }
  ],
  "previousStatement": "encounterLinkThreshold",
  "nextStatement": "encounterLinkThreshold",
  "colour": 180,
  "tooltip": "Encounter link with threshold for weighted list.",
  "helpUrl": ""
},
{
  "type": "actionnumber",
  "message0": "%1 actions.",
  "args0": [
    {
      "type": "field_number",
      "name": "actionNumberNumber",
      "value": 0,
      "min": 0
    }
  ],
  "output": null,
  "colour": 180,
  "tooltip": "A set number of actions.",
  "helpUrl": ""
},
{
  "type": "rndactionrange",
  "message0": "between %1 and %2 actions.",
  "args0": [
    {
      "type": "field_number",
      "name": "rndActionRangeMin",
      "value": 0,
      "min": 0
    },
    {
      "type": "field_number",
      "name": "rndActionRangeMax",
      "value": 0,
      "min": 1
    }
  ],
  "output": null,
  "colour": 180,
  "tooltip": "A random range of actions, from zero to infinity.",
  "helpUrl": ""
},
{
  "type": "branches",
  "message0": "Branches: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "branchesList",
      "check": "branchDef"
    }
  ],
  "previousStatement": "encounterKey",
  "nextStatement": "encounterKey",
  "colour": 315,
  "tooltip": "Allows conditional chaining and text inserts.",
  "helpUrl": ""
},
{
  "type": "branchdef",
  "message0": "Branch %1 , chance: %2 %% %3 %4",
  "args0": [
    {
      "type": "field_input",
      "name": "branchDefID",
      "text": "branchID"
    },
    {
      "type": "field_number",
      "name": "branchDefChanceNumber",
      "value": 0,
      "min": 1,
      "max": 100
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "branchDefKeyList",
	  "check": "branchDefKey",
    }
  ],
  "previousStatement": "branchDef",
  "nextStatement": "branchDef",
  "colour": 300,
  "tooltip": "A branch definition.",
  "helpUrl": ""
},
{
  "type": "branchtextnotes",
  "message0": "Text Notes: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "branchTextNotesList",
      "check": [
        "stringNote",
        "stringNoteWeighted"
      ]
    }
  ],
  "previousStatement": "branchDefKey",
  "nextStatement": "branchDefKey",
  "colour": 300,
  "tooltip": "Text notes. One will be displayed when this branch activates.",
  "helpUrl": ""
},
{
  "type": "branchchained",
  "message0": "Chained encounters: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "branchChainedList",
      "check": [
        "encounterLink",
        "encounterLinkThreshold"
      ]
    }
  ],
  "previousStatement": "branchDefKey",
  "nextStatement": "branchDefKey",
  "colour": 300,
  "tooltip": "Encounters to chain into when this branch activates. Does not allow occurrence checks, yet!",
  "helpUrl": ""
},
{
  "type": "branchtriggers",
  "message0": "Triggers: %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "branchTriggerList",
      "check": "trigger"
    }
  ],
  "previousStatement": "branchDefKey",
  "nextStatement": "branchDefKey",
  "colour": 300,
  "tooltip": "Triggers for this branch.",
  "helpUrl": ""
}]);

Blockly.JavaScript['triggers'] = function(block) {
  var statements_triggers = Blockly.JavaScript.statementToCode(block, 'triggers');
  var code = 'triggers:[' + statements_triggers + '],\n';
  return code;
};

Blockly.JavaScript['trigger'] = function(block) {
  var text_trigger = block.getFieldValue('trigger');
  var code = '`' + text_trigger + '`,';
  return code;
};

Blockly.JavaScript['encounterdef'] = function(block) {
  var text_encounterid = block.getFieldValue('encounterID');
  var statements_encounterkeys = Blockly.JavaScript.statementToCode(block, 'encounterKeys');
  var code = text_encounterid + ':{encounterID:`' +  text_encounterid + '`,\n' + statements_encounterkeys + '},\n';
  return code;
};

Blockly.JavaScript['opener'] = function(block) {
  var number_encounterchance = block.getFieldValue('encounterChance');
  var statements_conditions = Blockly.JavaScript.statementToCode(block, 'conditions');
  var code = 'chance:' + number_encounterchance + ',\n' + statements_conditions;
  return code;
};

Blockly.JavaScript['inputlock'] = function(block) {
  var code = 'inputLock:True,\n';
  return code;
};

Blockly.JavaScript['outputlock'] = function(block) {
  var code = 'outputLock:True,\n';
  return code;
};

Blockly.JavaScript['prerequisite'] = function(block) {
  var statements_prereqencs = Blockly.JavaScript.statementToCode(block, 'prereqEncs');
  var code = 'prerequisite:[' + statements_prereqencs + '],\n';
  return code;
};

Blockly.JavaScript['encountercount'] = function(block) {
  var text_encountercountid = block.getFieldValue('encounterCountID');
  var number_encountercountnumber = block.getFieldValue('encounterCountNumber');
  var code = '[`' + text_encountercountid + '`,' + number_encountercountnumber + '],';
  return code;
};

Blockly.JavaScript['blockers'] = function(block) {
  var statements_blockersEncs = Blockly.JavaScript.statementToCode(block, 'blockersEncs');
  var code = 'blockers:[' + statements_blockersEncs +  '],\n';
  return code;
};

Blockly.JavaScript['totalactiondelay'] = function(block) {
  var number_totalactiondelaynumber = block.getFieldValue('totalActionDelayNumber');
  var code = 'totalActionDelay:' + number_totalactiondelaynumber + ',\n';
  return code;
};

Blockly.JavaScript['textnotes'] = function(block) {
  var statements_textnoteslist = Blockly.JavaScript.statementToCode(block, 'textNotesList');
  var code = 'textNotes:[' + statements_textnoteslist + '],\n';
  return code;
};

Blockly.JavaScript['contextnotes'] = function(block) {
  var statements_contextnoteslist = Blockly.JavaScript.statementToCode(block, 'contextNotesList');
  var code = 'contextNotes:[' + statements_contextnoteslist + '],\n';
  return code;
};

Blockly.JavaScript['messagestring'] = function(block) {
  var text_messagestringtext = block.getFieldValue('messageStringText');
  var code = 'messageString:`' + text_messagestringtext + '`,\n';
  return code;
};

Blockly.JavaScript['addwi'] = function(block) {
  var statements_addwientries = Blockly.JavaScript.statementToCode(block, 'addWIentries');
  var code = 'addWI:[' + statements_addwientries + '],\n';
  return code;
};

Blockly.JavaScript['wientry'] = function(block) {
  var text_wientrykeys = block.getFieldValue('WIentryKeys');
  var text_wientrytext = block.getFieldValue('WIentryText');
  var code = '{keys:`' + text_wientrykeys + '`, entry:`' + text_wientrytext + '`},';
  return code;
};

Blockly.JavaScript['activationdelay'] = function(block) {
  var value_activationDelayNumber = Blockly.JavaScript.valueToCode(block, 'activationDelayNumber', Blockly.JavaScript.ORDER_NONE);
  var code = 'activationDelay:' + value_activationDelayNumber + ',\n';
  return code;
};

Blockly.JavaScript['displaynotes'] = function(block) {
  var statements_displaynotelist = Blockly.JavaScript.statementToCode(block, 'displayNoteList');
  var code = 'displayNotes:[' + statements_displaynotelist + '],\n';
  return code;
};

Blockly.JavaScript['stringnote'] = function(block) {
  var text_stringnotetext = block.getFieldValue('stringNoteText');
  var code = '`' + text_stringnotetext + '`,';
  return code;
};

Blockly.JavaScript['stringnoteweighted'] = function(block) {
  var text_stringnotetext = block.getFieldValue('stringNoteText');
  var number_stringnotethreshold = block.getFieldValue('stringNoteThreshold');
  var code = '[`' + text_stringnotetext + '`,' + number_stringnotethreshold + '],';
  return code;
};

Blockly.JavaScript['displaynote'] = function(block) {
  var text_displaynotekeytext = block.getFieldValue('displayNoteKeyText');
  var text_displaynotevaluetext = block.getFieldValue('displayNoteValueText');
  var colour_displaynotecolor = block.getFieldValue('displayNoteColor');
  var code = '[`' + text_displaynotekeytext + '`, `' + text_displaynotevaluetext + '`, ' + colour_displaynotecolor + '],';
  return code;
};

Blockly.JavaScript['countoccurrence'] = function(block) {
  var code = 'countOccurrence:true,\n';
  return code;
};

Blockly.JavaScript['memoryadd'] = function(block) {
  var text_memorytext = block.getFieldValue('memoryText');
  var dropdown_memorylocation = block.getFieldValue('memoryLocation');
  var number_memorylingerduration = block.getFieldValue('memoryLingerDuration');
  var code = 'memoryAdd:{`' + text_memorytext + '`, `' + dropdown_memorylocation + '`, ' + number_memorylingerduration + '},\n';
  return code;
};

Blockly.JavaScript['cooldown'] = function(block) {
  var value_cooldownNumber = Blockly.JavaScript.valueToCode(block, 'cooldownNumber', Blockly.JavaScript.ORDER_NONE);
  var code = 'cooldown:' + value_cooldownNumber + ',\n';
  return code;
};

Blockly.JavaScript['duration'] = function(block) {
  var value_durationNumber = Blockly.JavaScript.valueToCode(block, 'durationNumber', Blockly.JavaScript.ORDER_NONE);
  var code = 'duration:' + value_durationNumber + ',\n';
  return code;
};

Blockly.JavaScript['endtriggers'] = function(block) {
  var statements_endtriggerslist = Blockly.JavaScript.statementToCode(block, 'endTriggersList');
  var code = 'endTriggers:[' + statements_endtriggerslist + '],\n';
  return code;
};

Blockly.JavaScript['chained'] = function(block) {
  var statements_chainedlist = Blockly.JavaScript.statementToCode(block, 'chainedList');
  var code = 'chained:[' + statements_chainedlist + '],\n';
  return code;
};

Blockly.JavaScript['encounterlink'] = function(block) {
  var text_encounterlinkid = block.getFieldValue('encounterLinkID');
  var code = '`' + text_encounterlinkid + '`,';
  return code;
};

Blockly.JavaScript['encounterlinkthreshold'] = function(block) {
  var text_encounterlinkid = block.getFieldValue('encounterLinkID');
  var number_encounterlinkthresholdnumber = block.getFieldValue('encounterLinkThresholdNumber');
  var code = '[`' + text_encounterlinkid + '`, ' + number_encounterlinkthresholdnumber + '],';
  return code;
};

Blockly.JavaScript['actionnumber'] = function(block) {
  var number_actionnumbernumber = block.getFieldValue('actionNumberNumber');
  var code = '' + number_actionnumbernumber;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['rndactionrange'] = function(block) {
  var number_rndactionrangemin = block.getFieldValue('rndActionRangeMin');
  var number_rndactionrangemax = block.getFieldValue('rndActionRangeMax');
  var code = '[' + number_rndactionrangemin + ',' + number_rndactionrangemax + ']';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['branches'] = function(block) {
  var statements_brancheslist = Blockly.JavaScript.statementToCode(block, 'branchesList');
  var code = 'branches:[\n' + statements_brancheslist + '],\n';
  return code;
};

Blockly.JavaScript['branchdef'] = function(block) {
  var text_branchdefid = block.getFieldValue('branchDefID');
  var number_branchdefchancenumber = block.getFieldValue('branchDefChanceNumber');
  var statements_branchdefkeylist = Blockly.JavaScript.statementToCode(block, 'branchDefKeyList');
  var code = '{branchID:`' + text_branchdefid + '`, branchChance:' + number_branchdefchancenumber + ', ' + statements_branchdefkeylist + '},\n';
  return code;
};

Blockly.JavaScript['branchtextnotes'] = function(block) {
  var statements_branchtextnoteslist = Blockly.JavaScript.statementToCode(block, 'branchTextNotesList');
  var code = 'branchTextNotes:[' + statements_branchtextnoteslist + '],';
  return code;
};

Blockly.JavaScript['branchchained'] = function(block) {
  var statements_branchchainedlist = Blockly.JavaScript.statementToCode(block, 'branchChainedList');
  var code = 'branchChained:[' + statements_branchchainedlist + '],';
  return code;
};

Blockly.JavaScript['branchtriggers'] = function(block) {
  var statements_branchtriggerlist = Blockly.JavaScript.statementToCode(block, 'branchTriggerList');
  var code = 'branchTriggers:[' + statements_branchtriggerlist + '],';
  return code;
};