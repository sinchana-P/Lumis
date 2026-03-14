/**
 * Basic test to verify Jest setup is working
 */
describe('Jest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true)
  })

  it('should have access to environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })
})
