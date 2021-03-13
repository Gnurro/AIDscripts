const modifier = (text) => {
  let modifiedText = text// This boilerplate is needed for FixQuotes!
  
  fixQuotes: {
  // Fix quotes in AI outputs:
  modifiedText = fixQuotes(modifiedText)
  }

  return { text: modifiedText }
}

// Don't modify this part
modifier(text)
