# Baccarat Recorder — Release Instructions

## How to release a new version

1. Make your code changes
2. Run these commands:

```bash
cd /home/craig/Documents/Claude/BaccaratRecorder
git add -A
git commit -m "describe your changes here"
git tag v1.x.x
git push origin main
git push origin v1.x.x
```

Replace `v1.x.x` with the next version number (e.g. v1.0.5, v1.1.0, v2.0.0).

## Watch the build

GitHub automatically builds all three platforms:
https://github.com/sharpertrading/baccarat-recorder/actions

## Download the installers when done

https://github.com/sharpertrading/baccarat-recorder/releases

- `Baccarat-Recorder-Setup.exe` — Windows (run installer, follow wizard)
- `Baccarat-Recorder.dmg`       — Mac (drag to Applications, right-click → Open first time)
- `Baccarat-Recorder.AppImage`  — Linux (mark executable, double-click)

## Run the app locally

```bash
cd /home/craig/Documents/Claude/BaccaratRecorder
npm start
```

## Contact
hammondcraig@yahoo.com
