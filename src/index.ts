import * as vscode from 'vscode'
import translate from '@simon_he/translate'

let { GenerateNames_Secret, GenerateNames_Appid } = process.env

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.replaceText', async () => {
    if (!GenerateNames_Appid) {
      GenerateNames_Appid = await vscode.window.showInputBox({
        prompt: '百度appid',
        ignoreFocusOut: true,
        password: true,
      })
    }
    if (!GenerateNames_Secret) {
      GenerateNames_Secret = await vscode.window.showInputBox({
        prompt: '百度Secret',
        ignoreFocusOut: true,
        password: true,
      })
    }

    const editor = vscode.window.activeTextEditor
    if (editor) {
      const selectedText = editor.document.getText(editor.selection)
      const options = generateNames(await translate(selectedText, {
        secret: GenerateNames_Secret,
        appid: GenerateNames_Appid,
        from: 'zh',
        to: 'en',
        salt: '1435660288',
      }) as string)
      const newText = await vscode.window.showQuickPick(options)
      if (newText)
        editor.edit(builder => builder.replace(editor.selection, newText))
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
  const strs = str.split(' ')
  if (strs.length === 1) {
    const lowStr = str.toLowerCase()
    return [lowStr, `_${lowStr}`, `_${lowStr}_`, `${lowStr}$`, `str${lowStr[0].toUpperCase()}${lowStr.slice(1)}`, `int${lowStr[0].toUpperCase()}${lowStr.slice(1)}`]
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
  // 8. str在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `str${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))
  // 9. str在变量名前加上数据类型或其他标识符的缩写
  result.push(strs.reduce((pre, cur) => `int${pre[0].toUpperCase()}${pre.slice(1).toLowerCase()}${cur[0].toUpperCase()}${cur.slice(1).toLowerCase()}`))

  return result
}
