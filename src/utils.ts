export function generateNames(str: string) {
  // 如果 str 中包含 the 或者 of 要把 the 去除,并且把 xx of yy 转换成 yyXX
  str = str.replace(/[tT]he\s+/g, '')
  if (/ of /.test(str)) {
    const [first, ...rest] = str.split(' of ')
    str = `${rest.join('')} ${first}`
  }
  const result = []

  const strs = str
    .replace(/[a-z]+([A-Z])/g, (all, v) => all.replace(v, ` ${v}`))
    .split(/[\s_-]/)
  if (strs.length === 1) {
    const lowStr = str.toLowerCase()
    return [...new Set([
      lowStr,
      `${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
      `_${lowStr}`,
      `_${lowStr}_`,
      `${lowStr}$`,
      `str${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
      `num${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
      `bool${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
      `arr${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
      `obj${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
      `int${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
      `string${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
      `float${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
      `double${lowStr[0].toUpperCase()}${lowStr.slice(1)}`,
    ])]
  }
  // 1. _
  result.push(strs.reduce((pre, cur) => `${pre.toLowerCase()}_${cur.toLowerCase()}`))
  // 2. -
  result.push(strs.reduce((pre, cur) => `${pre.toLowerCase()}-${cur.toLowerCase()}`))
  // 3. 小驼峰
  result.push(strs.map((cur, i) => i === 0 ? `${cur[0].toLocaleLowerCase() + cur.slice(1)}` : `${cur[0].toUpperCase() + cur.slice(1)}`).join(''))
  // 4. 大驼峰
  result.push(strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join(''))
  // 5. 最后$
  result.push(strs.reduce((pre, cur, i) => `${pre.toLowerCase()}-${cur.toLowerCase()}${i === strs.length - 1 ? '$' : ''}`))
  // 6. _xx-
  result.push(strs.reduce((pre, cur, i) => `${i === 1 ? '_' : ''}${pre.toLowerCase()}-${cur.toLowerCase()}`))
  // 7. _xx__
  result.push(strs.reduce((pre, cur, i) => `${i === 1 ? '_' : ''}${pre.toLowerCase()}__${cur.toLowerCase()}`))
  // 8. 每个单词首字母都大写
  result.push(strs.reduce((pre, cur) => `${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 9. string在变量名前加上数据类型或其他标识符的缩写
  result.push(`string${strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join('')}`)
  // 10. int在变量名前加上数据类型或其他标识符的缩写
  result.push(`int${strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join('')}`)
  // 11. float在变量名前加上数据类型或其他标识符的缩写
  result.push(`float${strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join('')}`)
  // 12. double在变量名前加上数据类型或其他标识符的缩写
  result.push(`double${strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join('')}`)
  // 13. str在变量名前加上数据类型或其他标识符的缩写
  result.push(`str${strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join('')}`)
  // 14. num在变量名前加上数据类型或其他标识符的缩写
  result.push(`num${strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join('')}`)
  // 15. bool在变量名前加上数据类型或其他标识符的缩写
  result.push(`bool${strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join('')}`)
  // 16. arr在变量名前加上数据类型或其他标识符的缩写
  result.push(`arr${strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join('')}`)
  // 17. obj在变量名前加上数据类型或其他标识符的缩写
  result.push(`obj${strs.map(cur => `${cur[0].toUpperCase() + cur.slice(1)}`).join('')}`)

  return [...new Set(result)]
}

export function hasChineseCharacters(str: string) {
  const pattern = /[\u4E00-\u9FA5]/ // 匹配中文字符的正则表达式范围
  return pattern.test(str)
}
