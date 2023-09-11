import styles from './Output.module.scss'
import React, { Component } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { DeleteIcon } from '../../constants/icons';
import IconButton from '../../library/IconButton/IconButton'

export default class Output extends Component {
  shouldInput = false
  inputCallback = () => {}

  loading() {
    const loading = [
      '| |',
      '/ \\',
      '- -',
      '\\ /'
    ]
    this.term.write('Interpreter loading ')
    let currentCharacter = 1
    this.term.write(loading[0])
    this.loading = setInterval(() => {
      this.term.write('\b \b')
      this.term.write('\b \b')
      this.term.write('\b \b')
      this.term.write(loading[currentCharacter])
      currentCharacter = (currentCharacter + 1) % loading.length
    }, 100)
  }

  fit = () => {
    this.fitAddon.fit();
  }

  componentDidMount() {
    const { fromBlockly, rows, cols } = this.props
    const terminalConfig = {
     
      theme: {
        foreground: '#ffffff',
        background: 'rgba(0, 0, 0, 0)'
      },
      allowTransparency: true,
      scrollback: 1000,
    }
    if (rows && cols) {
      terminalConfig.rows = rows
      terminalConfig.cols = cols
    }
    const term = new Terminal(terminalConfig);
    this.term = term
    window['output-code-playground' + this.props.id] = term;
    term.open(document.getElementById('output-code-playground' + this.props.id));
    // remove tabIndex attribute from terminal which causes some issues
    const myElement = document.querySelector('.terminal');
    if(myElement){
      myElement.removeAttribute('tabIndex');
    }
    if (!rows && !cols) {
      const fitAddon = new FitAddon();
      this.fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      fitAddon.fit();
      window['fitAddon'] = fitAddon

      window.addEventListener('resize', this.fitAddon, false)
    }
    var input = "";
    var cursor = 0;
    if (this.props.isWASMSupported && this.props.loading) {
      this.loading()
    }
    term.onData((data) => {
      if (!this.shouldInput) return
      const code = data.charCodeAt(0)
      if (code === 27) {
        // ARROW KEYS

        switch (data.substr(1)) {
          // RIGHT
          case '[C':
            if (cursor < input.length) {
              cursor += 1
              term.write(data)
            }
            break;
          // LEFT
          case '[D':
            if (cursor > 0) {
              cursor -= 1
              term.write(data)
            }
            break;
          default:
            break;
        }
      } else if (code === 13) {
        // ENTER KEY
        term.write('\r\n')
        this.inputCallback(input)
        this.shouldInput = false
        input = "";
        cursor = 0
      } else if (code === 127) {
        // BACKSPACE

        // check if there is some text to delete
        if (input.slice(0, cursor).length === 0) return

        let backspace = `\b \b`
        if (input.slice(cursor).length > 0) {
          term.write(backspace)
          term.write(input.slice(cursor))
          term.write('\x1B[C')
          term.write(backspace)
          term.write(`\x1B[${input.slice(cursor).length}D`)
          // term.write(`${backspace}\x1B[${input.substr(cursor).length}D\b \b`)
          // term.write(`${backspace}\x1B[${input.substr(cursor).length}D\b \b`)
        } else {
          term.write(backspace)
        }
        input = input.slice(0, cursor - 1) + input.slice(cursor)
        cursor -= 1
      } else if (code < 32) {
        return;
      } else {
        term.write(data + 
          input.substr(cursor));
        if (input.substr(cursor).length > 0) {
          term.write(`\x1B[${input.substr(cursor).length}D`)
        }
        input = input.substr(0, cursor) + 
            data + 
            input.substr(cursor);
        cursor += 1
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.fitAddon, false)
  }

  componentDidUpdate(prevProps) {
    if ((this.props.loading !== prevProps.loading) && this.props.loading && this.props.fromEvaluation) {
      this.loading()
    }
    if (!this.props.loading && prevProps.loading) {
      clearInterval(this.loading)
      this.term.write('\r\n')
      setTimeout(() => {
        this.clear()
      }, 0)
    }
  }

  write(text) {
    this.term.write(text)
  }

  prompt(callback) {
    this.inputCallback = callback
    this.term.focus()
    this.shouldInput = true
  }

  clear() {
    this.term.reset()
  }

  blur() {
    this.term.blur()
  }
  
  render() {
    const { fromBlockly, id, style, fromEvaluation } = this.props
    return (
      fromBlockly ? <div id={'output-code-playground' + id} style={{ width: '100%', height: '100%', paddingLeft: '5px' }}></div> : (
        <div className={!fromEvaluation ? styles.outputWrapper : ''} style={style}>
          <div id={'output-code-playground' + id} className={styles.outputContainer} style={{ marginLeft: fromEvaluation ? '10px' : null }} >

          </div>

          
          {!fromEvaluation ? <IconButton onClick={this.props.clearInterpreter} primaryGradient size="large" style={{position: 'absolute', bottom: '56px', right: '48px', zIndex: 100}}>
            <DeleteIcon />
          </IconButton> : null}
         
        </div>
      )
    )
  }
}
