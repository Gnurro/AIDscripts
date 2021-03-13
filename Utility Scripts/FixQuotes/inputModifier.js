const modifier = (text) => {
  let modifiedText = text// This boilerplate is needed for FixQuotes!
  
  fixQuotes: {
  // Fix quotes in player inputs: (Useful if using 'story' or 'do' to say something.)
  modifiedText = fixQuotes(modifiedText)
  }

  return { text: modifiedText }
}

// Don't modify this part
modifier(text)
