'use strict'

//defined a parser class
class Parser {
  constructor(lexer) {
    this.lexer = lexer
  }

  parse(text) {
    this.tokens = this.lexer.lex(text)
    //_.first get the first item in the array
    return this.primary()
  }

  primary() {
    let token = this.tokens[0]
    let primary = token.fn
    if (token.constant) {
      primary.constant = true
      primary.literal = true
    }
    return primary
  }
}


//add escape character we support
const ESCAPES = {'n': '\n', 'f': '\f', 'r': '\r', 't': '\t', 'v': '\v', '\'': '\'', '"': '"'}

//add character for true, false and null
const CONSTANTS = {
  'null': _.constant(null),
  'true': _.constant(true),
  'false': _.constant(false)
}
_.forEach(CONSTANTS, (fn, constantName) => {
  fn.constant = fn.literal = true
})

//defined a lexer class
class Lexer {
  constructor() {

  }

  peek() {
    return this.index < this.text.length - 1 ?
      this.text.charAt(this.index + 1) :
      false
  }

//the method for lex expression
  lex(text) {
    this.text = text
    this.index = 0
    this.ch = undefined
    this.tokens = []

    while (this.index < this.text.length) {
      this.ch = this.text.charAt(this.index)
      if (this.isNumber(this.ch) || (this.ch === '.' && this.isNumber(this.peek()))) {
        this.readNumber()
      } else if (this.ch === '\'' || this.ch === '"') {
        this.readString(this.ch)
      } else if (this.isIden(this.ch)) {
        this.readIdent()
      } else if (this.isWhitespace(this.ch)) {
        this.index++
      } else {
        throw 'Unexpected next character: ' + this.ch
      }
    }

    return this.tokens
  }

//some methods for judge current charactor
  isNumber(ch) {
    return '0' <= ch && ch <= '9'
  }

  isExpOperator(ch) {
    return ch === '-' || ch === '+' || this.isNumber(ch)
  }

  isIden(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === '$'
  }

  isWhitespace(ch) {
    return (ch === ' ' || ch === '\r' || ch === '\t'  || ch === '\n' || ch === '\v' || ch === '\u00A0')
  }

//some methods for traversal text
  readNumber() {
    let number = ''
    while (this.index < this.text.length) {
      let ch = this.text.charAt(this.index).toLowerCase()
      if (ch === '.' || this.isNumber(ch)) {
        number += ch
      } else {
        let nextCh = this.peek()
        let prevCh = number.charAt(number.length - 1)
        if (ch === 'e' && this.isExpOperator(nextCh)) {
          number += ch
        } else if (this.isExpOperator(ch) && prevCh === 'e' && nextCh && this.isNumber(nextCh)) {
          number += ch
        } else if (this.isExpOperator(ch) && prevCh === 'e' && (!nextCh || !this.isNumber(nextCh))) {
          throw 'invalid exponent'
        } else {
          break
        }
      }
      this.index++
    }
    number = 1 * number
    this.tokens.push({
      text: number,
      //the number to return when the functon invoked
      fn: _.constant(number),
      constant: true
    })
  }

  readString(quote) {
    this.index++
    let rawString = quote
    let string = ''
    let escape = false
    while (this.index < this.text.length) {
      let ch = this.text.charAt(this.index)
      rawString += ch
      if (escape) {
        if (ch === 'u') {
          let hex = this.text.substring(this.index + 1, this.index + 5)
          if (!hex.match(/[\da-f]{4}/i)) {
            throw 'Invalid unicode escape'
          }
          rawString += hex
          this.index += 4
          string += String.fromCharCode(parseInt(hex, 16))
        } else {
          let replacement = ESCAPES[ch]
          if (replacement) {
            string += replacement
          } else {
            string += ch
          }
        }
        escape = false
      } else if (ch === quote) {
        this.index++
        this.tokens.push({
          text: rawString,
          constant: true,
          fn: _.constant(string)
        })
        return;
      } else if (ch === '\\') {
        escape = true
      } else {
        string += ch
      }
      this.index++
    }
    throw 'Unmatched quote'
  }

  readIdent() {
    let text = ''
    while (this.index < this.text.length) {
      let ch = this.text.charAt(this.index)
      if (this.isIden(ch) || this.isNumber(ch)) {
        text += ch
      } else {
        break
      }
      this.index++
    }

    let token = {
      text: text,
      fn: CONSTANTS[text]
    }

    this.tokens.push(token)
  }
}


function parse(expr) {
  let lexer = new Lexer()
  let parser = new Parser(lexer)
  return parser.parse(expr)
}
