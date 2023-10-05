import * as vscode from 'vscode'
import translate from '@simon_he/translate'
import { message } from '@vscode-use/utils'

let { GenerateNames_Secret, GenerateNames_Appid } = process.env

export function activate(context: vscode.ExtensionContext) {
  const cacheMap = new Map()
  const disposable = vscode.commands.registerCommand('extension.replaceText', async () => {
    if (!GenerateNames_Appid) {
      GenerateNames_Appid = await vscode.window.showInputBox({
        prompt: '百度appid',
        ignoreFocusOut: true,
        password: true,
        placeHolder: '输入百度appid',
      })
    }
    if (!GenerateNames_Secret) {
      GenerateNames_Secret = await vscode.window.showInputBox({
        prompt: '百度Secret',
        ignoreFocusOut: true,
        password: true,
        placeHolder: '输入百度Secret',
      })
    }

    const editor = vscode.window.activeTextEditor
    if (editor) {
      try {
        const selectedText = editor.document.getText(editor.selection)
        let options
        if (cacheMap.has(selectedText)) {
          options = cacheMap.get(selectedText)
        }
        else {
          options = generateNames(await translate(selectedText, {
            secret: GenerateNames_Secret,
            appid: GenerateNames_Appid,
            from: 'zh',
            to: 'en',
            salt: '1435660288',
          }) as string)
          cacheMap.set(selectedText, options)
        }

        const newText = await vscode.window.showQuickPick(options)
        if (newText)
          editor.edit(builder => builder.replace(editor.selection, newText))
      }
      catch (error: any) {
        message.error(error.message)
      }
    }
    else {
      vscode.window.showErrorMessage('No active text editor')
    }
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {

}

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
