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


//defined a lexer class
class Lexer {
  constructor() {

  }

  peek() {
    return this.index < this.text.length - 1 ? 
      this.text.charAt(this.index + 1) :
      false
  }

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
      } else {
        throw 'Unexpected next character: ' + this.ch
      }
    }

    return this.tokens
  }

  isNumber(ch) {
    return '0' <= ch && ch <= '9'
  }

  isExpOperator(ch) {
    return ch === '-' || ch === '+' || this.isNumber(ch)
  }

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
    let string = ''
    while (this.index < this.text.length) {
      let ch = this.text.charAt(this.index)
      if (ch === quote) {
        this.index++
        this.tokens.push({
          constant: true,
          fn: _.constant(string)
        })
        return;
      } else {
        string += ch
      }
      this.index++
    }
    throw 'Unmatched quote'
  }
}


function parse(expr) {
  let lexer = new Lexer()
  let parser = new Parser(lexer)
  return parser.parse(expr)
}
