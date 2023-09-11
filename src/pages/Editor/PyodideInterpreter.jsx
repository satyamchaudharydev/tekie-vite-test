/* eslint-disable no-undef */
import { get } from 'lodash';
import React, { forwardRef, useEffect, useRef, useState, useImperativeHandle } from 'react'
const PyodideInterpreter = forwardRef(({
  id: editorId,
  pythonCode,
  loadingMessage = 'loading…',
  evaluatingMessage = 'evaluating…',
  outputRef,
  clearInterpretor = () => {},
  clearLoading  = () => {},
  isBlocky = false,
  timeout,
  fromEvaluation
}, ref) => {
  const indexURL = 'https://dsd4auyo4ifts.cloudfront.net/pyodideBundle/v18.1/'
  const pyodide = useRef(null)
  const [isPyodideLoading, setIsPyodideLoading] = useState(true)
  const [error,setError] = useState(null)
  const [pyodideOutput, setPyodideOutput] =
  useState(evaluatingMessage)
  
  function pythonConsoleStdOut(text) {
    const output = `${text}\n`;
    const isBlocky = get(window, 'pyodideConfig.isBlocky');
    const editorId = get(window, 'pyodideConfig.activeEditorId');
    const pyodideOutput = window[`output-code-playground${editorId}`];
    console.log(`Python stdout [ID: ${editorId}] : `, output, pyodideOutput);
    const blocklyOutputDiv = document.getElementById(`blocklyPythonOutput${editorId || ''}`);
    if (output.indexOf('\n') === -1) {
      isBlocky ? blocklyOutputDiv.innerHTML = output : pyodideOutput && pyodideOutput.write(output)
    } else {
      output.split('\n').forEach((outputText, i) => {
        isBlocky ? blocklyOutputDiv.innerHTML += outputText : pyodideOutput && pyodideOutput.write(outputText)
        if (i !== output.split('\n').length - 1) {
          isBlocky ? blocklyOutputDiv.innerHTML += '\r\n' : pyodideOutput && pyodideOutput.write('\r\n')
        }
      });
    }
  }

	function pythonConsoleStdErr(text) {
		console.error("Python stderr: %o", text);
	}


  const [pythonOutput, setPythonOutput] = useState(evaluatingMessage)
  // load pyodide wasm module and initialize it
  useImperativeHandle(ref, () => ({
    runCodeOnPlay() {
      runCodeOnPlay(pyodide, pythonCode)
    }
  }));

  const loadPyodideAndPythonOutput = () => {
    ;(async function () {
      try {
        pyodide.current = await globalThis.loadPyodide({
          indexURL,
          stdout: pythonConsoleStdOut,
          stderr: pythonConsoleStdErr
        });
        // for clearing out pyodide custom output when initializing get comleted
        if(window[`output-code-playground${editorId}`]){
          window[`output-code-playground${editorId}`].clear()
        }
      
        const customPyodideModule = {
            // customInputPrompt is a function that will be called by Python's input() function
            customInputPrompt(text) {
              return prompt(text);
            }
        };
        // registerJsModule registers a JavaScript module with Pyodide.
        await pyodide.current.registerJsModule("customPyodideModule", customPyodideModule);
        // replacing default python input with the custom input function.  
        pyodide.current.runPython(`
          from customPyodideModule import customInputPrompt
          input = customInputPrompt
          __builtins__.input = customInputPrompt
        `);
        setIsPyodideLoading(false)
        clearLoading()
        if (pythonOutput) {
          setPythonOutput('')
        }
        // if (outputRef && outputRef.write) {
          // outputRef.clear()
          // clearInterpretor()
        // }
      } catch (e) {
        console.warn({ e })
        if (e && e.message && e.message.includes('already loading')) {
          if (window && window.pyodide) {
            pyodide.current = window.pyodide
          } else if (window && window.__pyodide_module) {
            pyodide.current = window.__pyodide_module
          }
          setIsPyodideLoading(false);
          clearLoading();
        }
      }
    })()
  }

  useEffect(() => {
    if (fromEvaluation) {
      setTimeout(() => {
        loadPyodideAndPythonOutput()
      }, timeout)
    } else {
      loadPyodideAndPythonOutput()
    }
  }, [pyodide, isPyodideLoading])
  // evaluate python code with pyodide and set output

  useEffect(() => {
    if (fromEvaluation) {
      setTimeout(() => {
        runCodeOnPlay(pyodide, pythonCode)
      }, timeout)
    } else {
      runCodeOnPlay(pyodide, pythonCode)
    }
  }, [isPyodideLoading, pyodide])

  const runCodeOnPlay = (pyodide, pythonCode) => {
    window.pyodideConfig = {
      activeEditorId: editorId,
      isBlocky,
    }
    if (!isPyodideLoading) {
      const evaluatePython = async (pyodide, pythonCode) => {
        try {
          setError(false)
          let output = pythonCode;
          const printWithEndPropRegex = /print\s*\(.+?,\s*end\s*=\s*(?:".*?"|'.*?')/g;
          if (pythonCode && pythonCode.match(printWithEndPropRegex)) {
						output += '\nprint()';
					}
          await pyodide.runPythonAsync(output);
          // const output = pyodide.runPython(`
          //   import sys
          //   sys.stdout.getvalue()
          // `) || ''
        } catch (error) {
          const blocklyOutputDiv = document.getElementById(`blocklyPythonOutput${editorId || ''}`);
          setError(true)
          const errorMessage = error.message || 'Some Error Occurred'
          const getOutput = (outputText) => {
            if(outputText){
              return `\x1b[38;5;203m${outputText}\x1b[0m`
            }
            return 'Some Error Occurred, Please check your blocks and try again.'
            }
          const blacklist = [
            'asyncio',
            'raise self._exception',
            'result = coro.send(None)',
            'exec_code',
            'eval_code_async',
            'CodeRunner',
            'run_async',
            'coroutine',
            'ast.parse',
            'return compile',
            'File "/lib/python3.8/ast.py"',
          ];
          const pyodideOutput = window[`output-code-playground${editorId}`];
          if (errorMessage.indexOf('\n') === -1) {
            isBlocky ? setPythonOutput(errorMessage) : pyodideOutput && pyodideOutput.write(errorMessage);
          } else {
            errorMessage.split('\n').forEach((outputText, i) => {
              for (const blockedText of blacklist) {
                if (outputText.includes(blockedText)) return;
              }
              isBlocky ? blocklyOutputDiv.innerHTML += outputText : pyodideOutput && pyodideOutput.write(`\x1b[38;5;203m${outputText}\x1b[0m`);
              if (i !== errorMessage.split('\n').length - 1) {
                isBlocky ? blocklyOutputDiv.innerHTML += '\r\n' : pyodideOutput && pyodideOutput.write(`\r\n`);
              }
            });
          }
          return error
        }
    }
    ;(async function () {
      setPyodideOutput(await evaluatePython(pyodide.current,
      pythonCode))
      })()
    }
  }

  // return [isPyodideLoading, pyodideOutput];
  return (
    <>
      {isBlocky && (
        <p id={`blocklyPythonOutput${editorId || ''}`} style={{ color: error ? '#ff8080' :'#fff' , padding: '0 10px', whiteSpace: 'pre-line' }}></p>
      )}
    </>
  )
});

export default PyodideInterpreter