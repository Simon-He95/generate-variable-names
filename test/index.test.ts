import { describe, expect, it } from 'vitest'
import { generateNames, hasChineseCharacters } from '../src/utils'

describe('hasChineseCharacters', () => {
  it('detects Han script', () => {
    expect(hasChineseCharacters('变量')).toBe(true)
    expect(hasChineseCharacters('abc')).toBe(false)
    expect(hasChineseCharacters('hello变量world')).toBe(true)
  })
})

describe('generateNames', () => {
  it('splits camelCase and generates snake_case', () => {
    const names = generateNames('userProfile')
    expect(names).toContain('user_profile')
    expect(names).toContain('userProfile')
    expect(names).toContain('UserProfile')
  })

  it('removes leading \"the\" and handles \"of\" reordering', () => {
    const names = generateNames('the color of user')
    expect(names).toContain('user_color')
    expect(names).toContain('userColor')
    expect(names).toContain('UserColor')
  })
})
