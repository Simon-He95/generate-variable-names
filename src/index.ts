import * as vscode from 'vscode'
import axios from 'axios'
import type { Options } from './type'

const md5 = require('md5')

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
      const options = generateNames(await getTranslate(selectedText, {
        secret: GenerateNames_Secret,
        appid: GenerateNames_Appid,
        from: 'zh',
        to: 'en',
        salt: '1435660288',
      }))
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

async function getTranslate(text: string, options: Options = {}) {
  const q = text
  const { from, to, salt, secret, appid } = options
  if (!secret || !appid)
    throw new Error('secret和appid不能为空，请申请百度翻译apk，http://api.fanyi.baidu.com/manage/developer')

  const sign = md5(appid + q + salt + secret)
  try {
    const { data: { error_code, error_msg, trans_result } } = await axios.get(`http://api.fanyi.baidu.com/api/trans/vip/translate?q=${text}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`)
    if (error_code)
      throw error_msg
    return trans_result[0].dst
  }
  catch (e: any) {
    GenerateNames_Secret = GenerateNames_Appid = undefined
    vscode.window.showWarningMessage(e)
    throw e
  }
}

function generateNames(str: string) {
  const result = []
  const strs = str.split(' ')
  if (strs.length === 1) {
    const lowStr = str.toLowerCase()
    return [lowStr, `_${lowStr}`, `_${lowStr}_`, `${lowStr}$`]
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

  return result
}
