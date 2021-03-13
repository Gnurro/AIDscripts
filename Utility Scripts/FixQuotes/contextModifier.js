const modifier = (text) => {
  const contextMemory = info.memoryLength ? text.slice(0, info.memoryLength) : ''
  const context = info.memoryLength ? text.slice(info.memoryLength) : text
  const contextLines = context.split("\n") // Safety rename for FixQuotes.
  if (contextLines.length > 2) {
    // Uncomment to use this!
    // const authorsNote = "Everyone in this story is an AI programmer."
    // contextLines.splice(-3, 0, `[Author's note: ${authorsNote}]`)
  }
  // Make sure the new context isn't too long, or it will get truncated by the server.
  const combinedLines = contextLines.join("\n").slice(-(info.maxChars - info.memoryLength))
  const finalText = [contextMemory, combinedLines].join("")
  return { text: finalText }
}

// Don't modify this part
modifier(text)
