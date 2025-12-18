import translateLoader from '@simon_he/translate'
import { createExtension, createInput, createProgress, getActiveTextEditor, message, registerCommand } from '@vscode-use/utils'
import * as vscode from 'vscode'
import { generateNames, hasChineseCharacters } from './utils'

const translateCache = new Map<string, unknown>()
const nameCache = new Map<string, string[]>()
export const { activate, deactivate } = createExtension(() => {
  const translate = translateLoader(translateCache as any)

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
              if (!value)
                return Promise.resolve('变量名不能为空')
              if (!hasChineseCharacters(value))
                return Promise.resolve('必须使用中文')
            },
          }) || ''
        }
        selectedText = selectedText.trim()
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
            if (nameCache.has(selectedText)) {
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
        let options: string[]
        if (nameCache.has(selectedText)) {
          options = nameCache.get(selectedText)!
        }
        else {
          const [translated = ''] = await translate(selectedText)
          options = generateNames(translated)
          nameCache.set(selectedText, options)
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
  translateCache.clear()
  nameCache.clear()
})
