'use strict'

//some helper methods
//disabled window, DOM-element and constructor
//varible
const CALL = Function.prototype.call
const APPLY = Function.prototype.apply
const BIND = Function.prototype.bind

const ensureSafeObject = (obj) => {
  if (obj) {
    if (obj.document && obj.location && obj.alert && obj.setInterval) {
      throw 'referencing window in angular expressions is disabled! '
    } else if (obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
      throw 'referencing DOM nodes in angular expressions is disabled! '
    } else if (obj.constructor === obj) {
      throw 'referencing Function in angular expressions is disabled! '
    } else if (obj.getOwnPropertyNames || obj.getOwnPropertyDescriptor) {
      throw 'reference Object in angular expressions is disabled! '
    }
  }
  return obj
}

const ensureSafeFunction = (obj) => {
  if (obj) {
    if (obj.constructor === obj) {
      throw 'referencing Function in angular expressions is disabled! '
    } else if (obj === CALL || obj === APPLY || obj === BIND) {
      throw 'referencing call, apply and bind in angular expressions' + obj + 'is disabled! '
    }
  }
  return obj
}

//defined a parser class
class Parser {
  constructor(lexer) {
    this.lexer = lexer
  }

  parse(text) {
    this.tokens = this.lexer.lex(text)
    //_.first get the first item in the array
    return this.assignment()
  }


//some helper methods
  expect(e1, e2, e3, e4) {
    let token = this.peek(e1, e2, e3, e4)
    if (token) {
      return this.tokens.shift()
    }
  }

  consume(e) {
    if (!this.expect(e)) {
      throw 'Unexpected Expecting' + e
    }
  }

  peek(e1, e2, e3, e4) {
    if (this.tokens.length > 0) {
      let text = this.tokens[0].text
      if (text === e1 || text === e2 || text === e3 || text === e4 || (!e1 && !e2 && !e3 && !e4)) {
        return this.tokens[0]
      }
    }
  }

  arrayDeclaration() {
    let elementFns = []
    if (!this.peek(']')) {
      do {
        if (this.peek(']')) {
          break;
        }
        elementFns.push(this.primary())
      } while (this.expect(','));
    }
    this.consume(']')
    let arrayFn = (scope, locals) => {
      let elements = _.map(elementFns, (elementFn) => {
        return elementFn(scope, locals)
      })
      return elements
    }
    arrayFn.literal = true
    arrayFn.constant = _.every(elementFns, 'constant')
    return arrayFn
  }

  object() {
    let keyValues = []
    if (!this.peek('}')) {
      do {
        let keyToken = this.expect()
        this.consume(':')
        let valueExpression = this.primary()
        keyValues.push({key: keyToken.string || keyToken.text, value: valueExpression})
      } while (this.expect(','));
    }
    this.consume('}')
    let objectFn = (scope, locals) => {
      let object = {}
      _.forEach(keyValues, (kv) => {
        object[kv.key] = kv.value(scope, locals)
      })
      return object
    }
    objectFn.literal = true
    objectFn.constant = _.every(keyValues, 'constant')
    return objectFn
  }

  objectIndex(objFn) {
    let indexFn = this.primary()
    this.consume(']')
    let objectIndexFn = (scope, locals) => {
      let obj = objFn(scope, locals)
      let index = indexFn(scope, locals)
      return ensureSafeObject(obj[index])
    }
    objectIndexFn.assign = (self, value, locals) => {
      let obj = ensureSafeObject(objFn(self, locals))
      let index = indexFn(self, locals)
      return (obj[index] = value)
    }
    return objectIndexFn
  }

  fieldAccess(objFn) {
    let token = this.expect()
    let getter = token.fn
    let fieldAccessFn = (scope, locals) => {
      let obj = objFn(scope, locals)
      return getter(obj)
    }
    fieldAccessFn.assign = (self, value, locals) => {
      let obj = objFn(self, locals)
      return setter(obj, token.text, value)
    }
    return fieldAccessFn
  }

  functionCall(fnFn, contextFn) {
    let argFns = []
    if (!this.peek(')')) {
      do {
        argFns.push(this.primary())
      } while (this.expect(','));
    }
    this.consume(')')
    return function(scope, locals) {
      let context = ensureSafeObject(contextFn ? contextFn(scope, locals) : scope)
      let fn = ensureSafeFunction(fnFn(scope, locals))
      let args = _.map(argFns, (argFn) => {
        return argFn(scope, locals)
      })
      return ensureSafeObject(fn.apply(context, args))
    }
  }

  assignment() {
    let left = this.primary()
    if (this.expect('=')) {
      if (!left.assign) {
        throw 'Implies assignment but cannot be assigned to '
      }
      let right = this.primary()
      return function(scope, locals) {
        return left.assign(scope, right(scope, locals), locals)
      }
    }
    return left
  }


//primary method which will return as finally result
  primary() {
    let primary
    if (this.expect('[')) {
      primary = this.arrayDeclaration()
    } else if (this.expect('{')) {
      primary = this.object()
    } else {
      let token = this.expect()
      primary = token.fn
      if (token.constant) {
        primary.constant = true
        primary.literal = true
      }
    }

    let next
    let context
    while ((next = this.expect('[', '.', '('))) {
      if (next.text === '[') {
        context = primary
        primary = this.objectIndex(primary)
      } else if (next.text === '.') {
        context = primary
        primary = this.fieldAccess(primary)
      } else if (next.text === '(') {
        primary = this.functionCall(primary, context)
        context = undefined
      }
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

//parse context
//ensure safe member name
const ensureSafeMemberName = (name) => {
  if (name === 'constructor' || name === '__proto__' || name === '__defineGetter__' || name === '__defineSetter__' || name === '__lookupGetter__' || name === '__lookupSetter__') {
    throw 'Attempting to access a disabled field in angular expressions! '
  }
}

const simpleGetterFn1 = (key) => {
  ensureSafeMemberName(key)
  return function(scope, locals) {
    if (!scope) {
      return undefined
    }
    return (locals && locals.hasOwnProperty(key) ? locals[key] : scope[key])
  }
}

const simpleGetterFn2 = (key1, key2) => {
  ensureSafeMemberName(key1)
  ensureSafeMemberName(key2)
  return function(scope, locals) {
    if (!scope) {
      return undefined
    }
    scope = (locals && locals.hasOwnProperty(key1)) ? locals[key1] : scope[key1]
    return scope ? scope[key2] : undefined
  }
}

const generatedGetterFn = (keys) => {
  return function(scope, locals) {
    if (!scope) {
      return undefined
    }
    _.forEach(keys, (key, idx) => {
      ensureSafeMemberName(key)
      if (!scope) { return undefined }
      if (idx === 0) {
        scope = (locals && locals.hasOwnProperty(key)) ? locals[key] : scope[key]
      } else {
        scope = scope[key]
      }
    })
    return scope
  }
}

const setter = (object, path, value) => {
  let keys = path.split('.')
  while (keys.length > 1) {
    let key = keys.shift()
    ensureSafeMemberName(key)
    if (!object.hasOwnProperty(key)) {
      object[key] = {}
    }
    object = object[key]
  }
  object[keys.shift()] = value
  return value
}

const getterFn = _.memoize((ident) => {
  let pathKeys = ident.split('.')
  let fn
  if (pathKeys.length === 1) {
    fn = simpleGetterFn1(pathKeys[0])
  } else if(pathKeys === 2) {
    fn = simpleGetterFn2(pathKeys[0], pathKeys[1])
  } else {
    fn = generatedGetterFn(pathKeys)
  }
  fn.assign = (self, value) => {
    return setter(self, ident, value)
  }
  return fn
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
      if (this.isNumber(this.ch) || (this.is('.') && this.isNumber(this.peek()))) {
        this.readNumber()
      } else if (this.is('\'"')) {
        this.readString(this.ch)
      } else if (this.is('[],{}:.()=')) {
        this.tokens.push({
          text: this.ch
        })
        this.index++
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

  is(chs) {
    return chs.indexOf(this.ch) >= 0
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
          string: string,
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
    let start = this.index
    let lastDotAt
    while (this.index < this.text.length) {
      let ch = this.text.charAt(this.index)
      if (this.isIden(ch) || this.isNumber(ch) || ch === '.') {
        if (ch === '.') {
          lastDotAt = this.index
        }
        text += ch
      } else {
        break
      }
      this.index++
    }

    let methodName
    let peekIndex
    if (lastDotAt) {
      peekIndex = this.index
      while (this.isWhitespace(this.text.charAt(peekIndex))) {
        peekIndex++
      }
      if (this.text.charAt(peekIndex) === '(') {
        //注意this.text与text指代不同的值
        methodName = text.substring(lastDotAt - start + 1)
        text = text.substring(0, lastDotAt - start)
      }
    }

    let token = {
      text: text,
      fn: CONSTANTS[text] || getterFn(text)
    }

    this.tokens.push(token)

    if (methodName) {
      this.tokens.push({
        text: '.'
      })
      this.tokens.push({
        text: methodName,
        fn: getterFn(methodName)
      })
    }
  }
}


function parse(expr) {
  let lexer = new Lexer()
  let parser = new Parser(lexer)
  return parser.parse(expr)
}
