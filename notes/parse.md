## literal expression

<pre>
  function parse(expr) {

  }
</pre>
传入一个表达式，返回一个函数，这个函数会在指定的上下文对象中调用

使用两个对象去完成所以工作

- Lexer：解析传入的表达式，比如传入'a + b'，解析成a, +, b
    - token = []
    - token[i] = {text: text, fn: foo(text)}
    - token[i].fn() : return a function that evaluates the expression in a given context

- Parser：the parser takes the token collection produced by the lexer and return a function that evaluates the expression in a given context
