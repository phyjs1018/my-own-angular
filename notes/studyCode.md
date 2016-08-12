
### 在一个对象上，创建一个（同名属性只会被创建一次）对象属性
<pre>
  const ensure = (obj, name, factory) {
    return obj[name] || (obj[name] = factory());
  }
</pre>