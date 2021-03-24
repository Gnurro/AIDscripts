// misc helper functions:
// get random
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min
}
// generic list-picker
function getRndFromList(list) {
  return (list[getRndInteger(0, list.length)])
}

// START of placeholder grab thing
const bracketed = /\[(.*?)\]/g // bracket definition; replace [ ] with symbol of choice - must match smybol used to encapsulate the placeholders in intro prompt!

// grab all bracketed things, put them into array in state
function grabAllBrackets() {
  for (entry of text.match(bracketed)) { // regExing return array, go through each entry in it
    entry = entry.replace(/\[|\]/g, '') // and remove the brackets
    if (!state.placeholders) { // if there isn't an array for this yet
      state.placeholders = [] // make it
    }
    state.placeholders.push(entry) // put the entries into array in state
  }
  console.log(state.placeholders) // to check
}

//grab only one specific bracketed thing, by count; use above function for longterm storage
function grabBracket(index) {
  return (text.match(bracketed)[index].replace(/\[|\]/g, ''))
}
// END of placeholder grab thing

// BEGIN RPG mechanic stuff


if (info.actionCount < 1) { // Only on first input
  // TODO: make this frameworky:
  grabAllBrackets() // get bracket contents into state.placeholders
  console.log("Grabbed brackets:" + state.placeholders.join(", "))
  
  state.charName = state.placeholders[0]
  state.charClassType = state.placeholders[1]
  state.petString = state.placeholders[2]
  state.petName = state.placeholders[3]
  
  delete state.placeholders
}

// stats + bot setup:

const statList = {
  intelligence:{
    name:"Intelligence",
    tag:"INT",
    icon:"🧠"},
  wisdom:{
    name:"Wisdom",
    tag:"WIS",
    icon:"🤔"},
  charisma:{
    name:"Charisma",
    tag:"CHA",
    icon:"🧠"},
  strength:{
    name:"Strength",
    tag:"STR",
    icon:"💪"},
  dexterity:{
    name:"Dexterity",
    tag:"DEX",
    icon:"💃"},
  constitution:{
    name:"Constitution",
    tag:"CON",
    icon:"😣"},
}

// classes:

const classDB = {
  // "character classes"/skillsets:
  // These must follow this format to work as intended!
  // witch:
  witch:{skills:['cackle', 'potBrew', 'dance', 'petHandle'],},
  // barbarian:
  barbarian:{skills:['rockThrow', 'rage', 'intimidate', 'heavyLift'],},
  //barbarian = {'Rock Throwing':0, 'Rageing':0, 'Heavy Lifting':0, 'Intimidating':0}
  // kobold:
  kobold:{skills:['buildTraps', 'hide', 'dragon', 'mining'],},
  //kobold = {'Trap Building':0, 'Hiding':0, 'Dragon Imitating':0, 'Mining':0}

}


// skills:
// new, fancy skills!
const skillDB = {
  
  // kobold = ['buildTraps', 'hide', 'dragon', 'mining']
  
  buildTraps:{
    menuString:"Trap Building",
    triggers:["\\b(build(ing)*|set(ting)*( up)*|lay down)(?=(trap(s)*|snare(s)*)","\\bdig( up)*(?=pit(fall)*)","\\bset(?=trigger(s)*)"], // to be regEx'd
    overrideAtt:true, // if this skills result strings override the att string
    results:{
      positive:["You are great at setting this up."],
      negative:["You mess up the construction."]
    }
  },
  
  // barbarian = ['rockThrow', 'rage', 'intimidate', 'heavyLift']
  
  heavyLift:{
    menuString:"Heavy Lifting",
    triggers:["\\b(lift(ing)*|heav(e|ing)*|heft(ing)*|hoist(ing)*|grab(bing)*)",] // to be regEx'd
    },

  
  rage:{
    menuString:"Rage",
    triggers:["\\brag(e|ing(ly)*)",], // to be regEx'd
    overrideAtt:false, // if this skills result strings override the att string
    results:{
      positive:["do it brutally well in your rage"],
      negative:["mess it up in your fury"]
    }
  },
  
  rockThrow:{
    menuString:"Rock Throwing",
    triggers:["\\b(hurl(ing)*|throw(ing)*|yeet(ing)*|lob(bing)*|chuck(ing)*)(?=(rock|boulder|stone))",], // to be regEx'd
    overrideAtt:false, // if this skills result strings override the att string
    results:{
      positive:["launch the rock"],
      negative:["drop the rock"]
    }
  },
  
  intimidate:{
    menuString:"Intimidation", // display name in the skills menu
    triggers:["\\bscar(e|ing)","\\bintimidat(e|ing(ly)*)","\\bmenac(e|ing(ly)*)","\\bcoerce"], // to be regEx'd
    overrideAtt:true, // if this skills result strings override the att string; more functionality to be added!
    results:{
      positive:["You are quite intimidating."],
      negative:["You don't scare anyone right now."]
    }
  },
    
  // witch = ['cackle', 'potBrew', 'dance', 'petHandle']
  
  potBrew:{
    menuString:"Potion Brewing",
    triggers:["\\bpotion","\\bbrew(?<=potion)(?=potion)","\\bvial","\\balchem(ic(al(y)*)*|y)"], // to be regEx'd
    overrideAtt:true, // if this skills result strings override the att string
    results:{
      positive:["You use your alchemical acumen."],
      negative:["You mess up the formula."]
    }
  },
  
  petHandle:{
    menuString:state.petString.charAt(0).toUpperCase() + state.petString.slice(1) + " Handling",
    triggers:[`\\b${state.petString}(?<=your)`, `\\b${state.petName}`], // to be regEx'd
    overrideAtt:true, // if this skills result strings override the att string
    results:{
      positive:[`You have great rapport with your ${state.petString}.`],
      negative:[`Your ${state.petString} doesn't follow your commands!`]
    }
  },
  
  dance:{
    menuString:"Dancing",
    triggers:["\\bdanc(e|ing)","\\btwirl","\\btwist","\\bpranc(e|ing)","\\bpirouett(e|ing)"], // to be regEx'd
    overrideAtt:false, // if this skills result strings override the att string
    results:{
      positive:["perform beautifully"],
      negative:["stumble around"]
    }
  },
  
  cackle:{
    menuString:"Cackling",
    triggers:["\\bcackl(e|ing)"] // to be regEx'd
  }
}


// Feats!
// Stuff that does context notes independent of skill use or checks and prolly sth for checks as well

const featDB = {
  


}

// Utility functions:
function makeModString(int) { // makes neat modifier strings with adaptive +/- depending on given value
  if (Number.isInteger(int)) {
    if (int >= 0) {
      string = "+" + int
    } else {
      string = "-" + Math.abs(int)
    }
  } else {
    string = ""
  }
  return (string)
}

// END RPG mechanic stuff

