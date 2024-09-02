import * as vscode from 'vscode'
import translateLoader from '@simon_he/translate'
import { createExtension, createInput, createProgress, getActiveTextEditor, message, registerCommand } from '@vscode-use/utils'

const cacheMap = new Map()
export const { activate, deactivate } = createExtension(() => {
  const translate = translateLoader(cacheMap)

  return [
    registerCommand('generate-variable-names.generateName', async () => {
      const editor = getActiveTextEditor()
      if (!editor)
        return
      let status: 'success' | 'failed' | 'pending' = 'pending'
      try {
        let selectedText = editor.document.getText(editor.selection)
        if (!selectedText || !hasChineseCharacters(selectedText)) {
          selectedText = await createInput({
            value: '',
            placeHolder: '输入要起的变量名的中文含义',
            title: '根据输入的变量中文名提供不同规则的变量名',
            validate(value) {
              if (!hasChineseCharacters(value))
                return Promise.resolve('必须使用中文')
              if (!value)
                return Promise.resolve('变量名不能为空')
            },
          }) || ''
        }
        if (!selectedText)
          return

        createProgress({
          title: '正在生成变量名',
          async done(report) {
            await new Promise((_resolve) => {
              let increment = 0
              const timer = setInterval(() => {
                if (increment < 99)
                  increment++

                if (status === 'success' || status === 'failed') {
                  _resolve(true)
                  clearInterval(timer)
                  return
                }
                report({
                  message: `Progress bar ${increment}% completed`,
                  increment,
                })
              }, 10)
            })
            if (cacheMap.has(selectedText)) {
              await new Promise((resolve) => {
                setTimeout(() => {
                  resolve(true)
                }, 100)
              })
            }
            if (status === 'success') {
              report({
                message: 'Progress bar 100% completed',
                increment: 100,
              })
            }
            else {
              report({
                message: '❌ Something Wrong',
                increment: 100,
              })
            }
          },
        })
        let options
        if (cacheMap.has(selectedText)) {
          options = cacheMap.get(selectedText)
        }
        else {
          options = generateNames(await translate(selectedText) as string)
          cacheMap.set(selectedText, options)
        }

        status = 'success'
        const newText = await vscode.window.showQuickPick(options)
        if (newText)
          editor.edit(builder => builder.replace(editor.selection, newText))
      }
      catch (error: any) {
        status = 'failed'
        message.error(error.message)
      }
    }),
  ]
}, () => {
  cacheMap.clear()
})

function generateNames(str: string) {
  const result = []

  const strs = str
    .replace(/[a-z]+([A-Z])/g, (all, v) => all.replace(v, ` ${v}`))
    .split(' ')
  if (strs.length === 1) {
    const lowStr = str.toLowerCase()
    return [
      lowStr,
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
    ]
  }
  // 1. _
  result.push(strs.reduce((pre, cur) => `${pre.toLowerCase()}_${cur.toLowerCase()}`))
  // 2. -
  result.push(strs.reduce((pre, cur) => `${pre.toLowerCase()}-${cur.toLowerCase()}`))
  // 3. 驼峰
  result.push(strs.reduce((pre, cur) => `${pre.toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 4. 最后$
  result.push(strs.reduce((pre, cur, i) => `${pre.toLowerCase()}-${cur.toLowerCase()}${i === strs.length - 1 ? '$' : ''}`))
  // 5. _xx-
  result.push(strs.reduce((pre, cur, i) => `${i === 1 ? '_' : ''}${pre.toLowerCase()}-${cur.toLowerCase()}`))
  // 6. _xx__
  result.push(strs.reduce((pre, cur, i) => `${i === 1 ? '_' : ''}${pre.toLowerCase()}__${cur.toLowerCase()}`))
  // 7. 每个单词首字母都大写
  result.push(strs.reduce((pre, cur) => `${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 8. string在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `string${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 9. int在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `int${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 10. float在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `float${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 11. double在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `double${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 12. str在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `str${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 13. num在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `num${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 14. bool在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `bool${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 15. arr在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `arr${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 15. obj在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `obj${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))

  return result
}

export function hasChineseCharacters(str: string) {
  const pattern = /[\u4E00-\u9FA5]/ // 匹配中文字符的正则表达式范围
  return pattern.test(str)
}
