/* eslint-disable */
import skA from './skulpt-min'
import skB from './skulpt-stdlib'

const builtinRead = x => {
  if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) {
    const error = `File not found: '${x}'`
    throw error
  }
  return Sk.builtinFiles.files[x]
}

const runCode = (codeString, outf, openPrompt, setPromptResolve) => {
  Sk.configure({
    output: outf,
    read: builtinRead,
    execLimit: 60000,
    inputfun: prompt => {
      return new Promise(function(resolve, reject) {
        console.log('prompt Text: ', prompt)
        setPromptResolve(resolve)
        openPrompt(prompt)
      })
    },
    inputfunTakesPrompt: true
  })
  Sk.python3 = true
  const myPromise = Sk.misceval.asyncToPromise(() =>
    Sk.importMainWithBody('<stdin>', false, codeString, true)
  )

  myPromise.then(
    mod => {},
    err => {
      outf(err.toString(), true)
    }
  )
}

export default runCode