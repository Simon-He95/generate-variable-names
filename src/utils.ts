export function generateNames(str: string) {
  // 如果 str 中包含 the 或者 of 要把 the 去除,并且把 xx of yy 转换成 yy xx
  str = normalizeInput(str)
  const words = splitIntoWords(str)
  if (words.length === 0)
    return []

  const results = createResultCollector()
  const pascal = toPascalCase(words)

  if (words.length === 1) {
    const low = words[0].toLowerCase()
    const cap = `${low[0].toUpperCase()}${low.slice(1)}`
    results.add(low)
    results.add(cap)
    results.add(`_${low}`)
    results.add(`_${low}_`)
    results.add(`${low}$`)
    results.add(`str${cap}`)
    results.add(`num${cap}`)
    results.add(`bool${cap}`)
    results.add(`arr${cap}`)
    results.add(`obj${cap}`)
    results.add(`int${cap}`)
    results.add(`string${cap}`)
    results.add(`float${cap}`)
    results.add(`double${cap}`)
    return results.done()
  }

  const lowerWords = words.map(w => w.toLowerCase())
  const snake = lowerWords.join('_')
  const kebab = lowerWords.join('-')
  const camel = `${pascal[0].toLowerCase()}${pascal.slice(1)}`
  const titleCase = lowerWords.map(w => `${w[0].toUpperCase()}${w.slice(1)}`).join('')

  // 1. _
  results.add(snake)
  // 2. -
  results.add(kebab)
  // 3. 小驼峰
  results.add(camel)
  // 4. 大驼峰
  results.add(pascal)
  // 5. 最后$
  results.add(`${kebab}$`)
  // 6. _xx-
  results.add(`_${kebab}`)
  // 7. _xx__
  results.add(`_${lowerWords.join('__')}`)
  // 8. 每个单词首字母都大写
  results.add(titleCase)
  // 9-17. 在变量名前加上数据类型或其他标识符的缩写
  results.add(`string${pascal}`)
  results.add(`int${pascal}`)
  results.add(`float${pascal}`)
  results.add(`double${pascal}`)
  results.add(`str${pascal}`)
  results.add(`num${pascal}`)
  results.add(`bool${pascal}`)
  results.add(`arr${pascal}`)
  results.add(`obj${pascal}`)

  return results.done()
}

const hanRegex = /\p{Script=Han}/u
export function hasChineseCharacters(str: string) {
  return hanRegex.test(str)
}

function normalizeInput(input: string) {
  let str = input.trim()
  str = str.replace(/\bthe\s+/gi, '')

  const parts = str.split(/\s+of\s+/i)
  if (parts.length > 1) {
    const [first, ...rest] = parts
    str = `${rest.join(' ')} ${first}`.trim()
  }

  return str
}

function splitIntoWords(str: string) {
  // camelCase / PascalCase / acronyms to spaced words
  const withSpaces = str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')

  return withSpaces
    .split(/[\s_-]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

function toPascalCase(words: string[]) {
  return words
    .map(word => word ? `${word[0].toUpperCase()}${word.slice(1)}` : '')
    .join('')
}

function createResultCollector() {
  const seen = new Set<string>()
  const result: string[] = []

  const add = (value: string) => {
    if (!value)
      return
    if (seen.has(value))
      return
    seen.add(value)
    result.push(value)
  }

  return {
    add,
    done() {
      return result
    },
  } as const
}
