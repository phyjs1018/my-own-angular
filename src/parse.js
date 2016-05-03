'use strict'

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

class Lexer {
  constructor() {

  }

  lex(text) {
    this.text = text
    this.index = 0
    this.ch = undefined
    this.tokens = []

    while (this.index < this.text.length) {
      this.ch = this.text.charAt(this.index)
      if (this.isNumber(this.ch)) {
        this.readNumber()
      } else {
        throw 'Unexpected next character: ' + this.ch
      }
    }

    return this.tokens
  }

  isNumber(ch) {
    return '0' <= ch && ch <= '9'
  }

  readNumber() {
    let number = ''
    while (this.index < this.text.length) {
      let ch = this.text.charAt(this.index)
      if (this.isNumber(ch)) {
        number += ch
      } else {
        break
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
}


function parse(expr) {
  let lexer = new Lexer()
  let parser = new Parser(lexer)
  return parser.parse(expr)
}
