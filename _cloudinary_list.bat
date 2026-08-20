@echo off
cd /d "%~dp0functions"
node_modules\.bin\tsx.cmd scripts/list-cloudinary.ts
