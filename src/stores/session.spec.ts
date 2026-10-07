import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSessionStore } from './session'

describe('session store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('arranca sin token', () => {
    expect(useSessionStore().token).toBeNull()
  })
})
