#!/usr/bin/env node
/**
 * LegiScan IL Bill Sync
 * Fetches active Illinois bills from LegiScan API and outputs summary.
 *
 * Setup: Get free API key at legiscan.com → set LEGISCAN_API_KEY in .env.local
 * Free tier: 30,000 queries/month
 *
 * Run: node scripts/legiscan-sync.mjs
 */

import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!existsSync(envPath)) {
    console.warn('⚠️  No .env.local found. Create one with LEGISCAN_API_KEY=your_key')
    return {}
  }
  const env = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const [key, ...vals] = line.split('=')
    if (key && !key.startsWith('#')) env[key.trim()] = vals.join('=').trim()
  }
  return env
}

const env = loadEnv()
const API_KEY = env.LEGISCAN_API_KEY

if (!API_KEY) {
  console.error('❌ LEGISCAN_API_KEY not set in .env.local')
  console.error('   Get a free key at: https://legiscan.com/user/register')
  process.exit(1)
}

const BASE_URL = 'https://api.legiscan.com/'

async function legiscan(op, params = {}) {
  const url = new URL(BASE_URL)
  url.searchParams.set('key', API_KEY)
  url.searchParams.set('op', op)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`LegiScan HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== 'OK') throw new Error(`LegiScan error: ${JSON.stringify(data)}`)
  return data
}

async function main() {
  console.log('🔍 TheJacket — LegiScan IL Bill Sync')
  console.log('=====================================\n')

  // Step 1: Get Illinois session list
  console.log('📋 Fetching IL session list...')
  const sessions = await legiscan('getSessionList', { state: 'IL' })
  const currentSession = sessions.sessions.find(s => s.year_end >= 2026 && s.special === 0)

  if (!currentSession) {
    console.error('❌ Could not find current IL session')
    process.exit(1)
  }

  console.log(`✅ Current session: ${currentSession.session_name} (ID: ${currentSession.session_id})`)
  console.log(`   Bills in session: ~${currentSession.prior_session || 'unknown'}`)

  // Step 2: Get master bill list (summary only, 1 query)
  console.log('\n📦 Fetching master bill list (1 query)...')
  const masterList = await legiscan('getMasterList', { session_id: currentSession.session_id })

  const bills = Object.values(masterList.masterlist).filter(b => b.bill_id)
  console.log(`✅ ${bills.length} bills in session`)

  // Step 3: Show sample
  console.log('\n📊 Sample active bills (first 10):')
  bills.slice(0, 10).forEach(b => {
    console.log(`  ${b.bill_number.padEnd(8)} | ${b.title?.substring(0, 60) || 'No title'}`)
  })

  console.log('\n✅ LegiScan connection verified.')
  console.log('   Next steps:')
  console.log('   1. Run node scripts/legiscan-sync.mjs to verify your API key works')
  console.log('   2. Add LEGISCAN_API_KEY to Vercel env vars when ready to deploy bills feature')
  console.log('   3. Build /app/bills/page.tsx for the bills tracker UI (Phase 2)')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
