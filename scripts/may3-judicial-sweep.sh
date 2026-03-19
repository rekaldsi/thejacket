#!/bin/bash
# May 3, 2026 — Judicial Retention Filing Deadline Sweep
# Fires on May 3 morning. Checks ISBA for updated judicial retention candidate list.
# Sends summary to Jerry via OpenClaw.

echo "=== May 3 Judicial Retention Sweep ==="
echo "Date: $(date)"
echo ""
echo "ACTION REQUIRED:"
echo "1. Visit https://www.isba.org/judicial-elections for updated bar ratings"
echo "2. Visit https://elections.il.gov for certified judicial retention candidates"
echo "3. Check chicagobar.org for Alliance of Bar Associations evaluations"
echo "4. Update data/judges/*.json files with retention candidates"
echo "5. Create new judge files for any new November retention candidates"
echo ""
echo "Cook County judicial retention deadline: May 3, 2026"
echo "November ballot judicial candidates will be certified by Illinois SBE shortly after."

openclaw system event --text "⚖️ TheJacket: May 3 judicial retention filing deadline today. Time to check ISBA + CBA for new judicial ratings and update judge profiles for November. Visit https://isba.org/judicial-elections and https://elections.il.gov" --mode now
