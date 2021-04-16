/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
 function consoleCheck() {
	console.log(Blockly.JavaScript.workspaceToCode())    
  }
 
 function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function saveBlocklySpace() {
	console.log('Trying to save workspace...')
	var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);	
	localStorage.setItem("encountersBlocklyWorkspace", Blockly.Xml.domToText(xml));
	console.log('Saved workspace XML:' + xml);
}

function loadBlocklySpace() {
	console.log('Trying to load workspace...')
	var xml = Blockly.Xml.textToDom(localStorage.getItem("encountersBlocklyWorkspace"));
	console.log('Loading workspace:' + xml);
	Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);	
}

function exportBlocklySpace(filename) {
    console.log('Trying to export workspace...')
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(Blockly.Xml.domToText(xml)));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    console.log('Exported workspace XML:' + xml);
}
/* I tried. This is just too over-complicated ... having to add a event listener to read a frickn plain text is just idiotic...
function importBlocklySpace() {
    console.log('Trying to import workspace...')

    const importFiles = document.getElementById("importXMLinput")
    const importFile = importFiles.files[0]
    // console.log(importFile)

    const reader = new FileReader()

    reader.onload = function() {

    }

    var blarb = reader.readAsText(importFile)

    console.log(blarb)



    // Blockly.Xml.clearWorkspaceAndLoadFromXml(importFile.files[0], Blockly.mainWorkspace)
    // var xml = Blockly.Xml.textToDom(importFile.files[0]);
    // console.log('Loading workspace:' + xml);
    // console.log(xml)
    // Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
}
*/

 (function() {

  let currentButton;

  function loadWorkspace(button) {
    let workspace = Blockly.getMainWorkspace();
    workspace.clear();
    if (button.blocklyXml) {
      Blockly.Xml.domToWorkspace(button.blocklyXml, workspace);
    }
  }

  function save(button) {
	
    button.blocklyXml = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
  }
  
  
  
  Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    scrollbars: true,
	collapse : true, 
	comments : true, 
	disable : true, 
	maxBlocks : Infinity, 
	trashcan : true, 
	horizontalLayout : true, 
	toolboxPosition : 'start', 
	rtl : false, 
	sounds : false, 
	oneBasedIndex : true
  });
})();
