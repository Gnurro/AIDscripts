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
