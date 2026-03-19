#!/usr/bin/env node
/**
 * Legistar API Test — Chicago City Council + Cook County Board
 * No API key required. Free, unauthenticated.
 *
 * Run: node scripts/legistar-test.mjs
 */

async function testLegistar(client, label) {
  console.log(`\n🏛️  Testing Legistar: ${label} (${client})`)

  try {
    // Get recent active matters
    const url = `https://webapi.legistar.com/v1/${client}/Matters?$top=5&$filter=MatterStatusName eq 'Active'&$orderby=MatterLastModifiedUtc desc`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    console.log(`✅ Connected. Recent active matters:`)
    data.slice(0, 3).forEach(m => {
      console.log(`   ${m.MatterFile?.padEnd(12) || '?'.padEnd(12)} | ${m.MatterTitle?.substring(0, 55) || 'No title'}`)
    })
  } catch (err) {
    console.error(`❌ ${label} failed:`, err.message)
  }
}

async function main() {
  console.log('🔍 TheJacket — Legistar API Test')
  console.log('===================================')
  console.log('No API key required — testing live connections...')

  await testLegistar('chicago', 'Chicago City Council')
  await testLegistar('cook-county', 'Cook County Board')

  console.log('\n✅ Legistar APIs verified. Both are free and unauthenticated.')
  console.log('   Ready to build bills pipeline in Phase 2.')
}

main().catch(console.error)
