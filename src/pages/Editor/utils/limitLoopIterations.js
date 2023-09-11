function getLastIndentationInBlock(block) {
  const lines = block.split('\n');
  const indentationRegex = /^([ \t]+)/;

  for (let i = lines.length - 1; i >= 0; i--) {
    const match = indentationRegex.exec(lines[i]);
    if (match) {
      return match[1];
    }
  }
  return '';
}

export function limitLoopIterations(codeString, maxIterations = 500) {
  const exceed_message = `⚠️ Infinite loop occurred. Limited runs to ${maxIterations} iterations. `
  const loopPatterns = [
    /(^|\n)[ \t]*while[ \t]+True:[ \t]*(\n|$)/g,
  ];

  const loopInjection = `
_loop_instance += 1
if _loop_instance >= ${maxIterations}:
    print("${exceed_message}")
    _loop_instance = 0
    break
`.trimStart();

  for (const loopPattern of loopPatterns) {
    let match;
    while ((match = loopPattern.exec(codeString))) {
      const loopStartPos = match[0].length + match.index;
      const previousBlock = codeString.slice(0, loopStartPos);
      const block = codeString.slice(loopStartPos);
      const indentation = getLastIndentationInBlock(block);
      let injectionCode = loopInjection
        .split("\n")
        .map((line,index) => {
          if(index > 1){
              return indentation + line + "  "

          }
          else {
              return indentation + line.trim();
          }
        })
      .join("\n");
      codeString =`${codeString.slice(0, loopStartPos).trimStart()}\n${injectionCode}\n${codeString.slice(loopStartPos)}`;
      loopPattern.lastIndex -= (match[0].length - 1);  // Move lastIndex back
    }
  }
  console.log({codeString})
  return `global _loop_instance\n_loop_instance = 0\n${codeString}`
}
  export const whileLimit = (code) => {
    const max_limit = 50
    const whileTrueRegex = /(^|\n)[ \t]*while\s*True\s*:/g
    
    const modifiedCode = code.replace(whileTrueRegex, `\nfor i in range(0,${max_limit}):`)
    console.log({modifiedCode})
    return modifiedCode
}
