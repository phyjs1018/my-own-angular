_.mixin({
  isArrayLike(obj) {
    if (_.isNull(obj) || _.isUndefined(obj)) {
      return false
    }
    let length = obj.length
    return _.isNumber(length)
  }
})
