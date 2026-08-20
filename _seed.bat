@echo off
cd /d "%~dp0functions"
npx tsx scripts/seed-firestore.ts 2>&1
echo Exit code: %errorlevel%
