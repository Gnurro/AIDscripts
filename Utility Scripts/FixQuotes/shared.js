fixQuotes: {
// Settings:
    const fixQuotesSettings = {verbose: false}

// logging:
    function fixQuotesLog(msg) {
        if (fixQuotesSettings.verbose) {
            console.log(msg)
        }
    }

// RegExes:
    const quoted = /"(.*?)"/g
    const openQuote = /"(.*?)%%%/g // %%% arbitrarily chosen as end marker
// Main function:
    function fixQuotes(inText) {
        let lines = inText.split('\n')
        let newLines = []
        for (let line of lines) {
            if (line.includes('\"')) {
                let checkLine = `${line.replace(quoted, "")}%%%`.match(openQuote)// Remove legit quotes from check; add end marker for open quote matching
                if (checkLine) {
                    fixQuotesLog(`'${line}' has open quote!`)
                    checkLine = checkLine[checkLine.length - 1].replace(/(%%%|\\")/g, "")
                    if (checkLine) {// null ~= false, so only trigger if the open quote contains anything
                        fixQuotesLog(`Added missing end quote to '${line}'!`)
                        newLines.push(line + '\"')
                    } else {// Leave properly trailing quotes
                        fixQuotesLog(`Trailing quote found in '${line}', keeping it in good faith.`)
                        newLines.push(line)
                    }
                } else {
                    fixQuotesLog(`No open quote found in '${line}', keeping it.`)
                    newLines.push(line)
                }
            } else {
                fixQuotesLog(`No quote found in '${line}', keeping it.`)
                newLines.push(line)
            }
        }
        return (newLines.join("\n"))
    }

// Utility functions:
    function grabQuotedIndex(index = 0) {
        return (text.match(quoted)[index])
    }

    function grabAllQuotedJSON(chkString = text) {
        return (JSON.stringify(chkString.match(quoted)))
    }

    function grabOpenQuote(chkString = text) {
        return (chkString.match(openQuote))
    }
}