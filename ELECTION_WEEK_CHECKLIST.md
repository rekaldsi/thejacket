# Election Week Infrastructure Checklist
**Complete before October 1, 2026**

- [ ] Upgrade Vercel to Pro ($20/mo) — Hobby = 100GB/month bandwidth cap, will fail under election traffic
- [ ] Add Cloudflare free tier CDN in front of Vercel (DNS → Cloudflare → Vercel)
- [ ] Enable Vercel Edge Caching on all static routes
- [ ] Test /my-ballot with 20+ real Cook County addresses before launch
- [ ] Verify Cicero API credits are funded (5K credits = ~5K lookups, cache aggressively)
- [ ] Run full data audit on all candidates, races, and ballot measures
- [ ] Test git push → Vercel deploy time (target: < 5 min from push to live)
- [ ] Set up Vercel deployment notifications to Jerry's Telegram
- [ ] Confirm results-manifest.json auto-updates on November results night
