# Motionroom — downloadable source

This is the complete editable web application, with the ten-scene **One More Try** demo and its audio files bundled. It is not a precompiled Windows EXE.

## Windows
1. Extract the entire ZIP first.
2. Double-click **start.bat**. It uses Node.js or Python 3 already installed on your computer. If neither is installed, install one first.
3. Open **http://127.0.0.1:8080** if the browser does not open automatically.
4. Keep the terminal window open while using Motionroom. Close it to stop the server.

There is no npm install, build step, account or internet connection needed to run the extracted app once Node.js or Python is installed. Use the local server: opening index.html directly can block audio and export-engine loading.

## macOS / Linux
Run `node start.cjs` from this folder, or `python3 -m http.server 8080 --bind 127.0.0.1 --directory dist`, then open the address above. `node start.cjs --no-open` disables automatic browser launch.

## Projects and audio
- The demo opens on load; saved browser work can be resumed from the Project menu.
- Use Project → Save to download your own portable project file. Browser storage belongs to the current browser and address; it does not automatically move between the online and local apps.
- Audio rows include actions, footsteps and ambience. Click any clip to change volume, fades, timing or mute; drag clips or their edges to move or trim them.
- All ten demo scenes have ambience: Quiet room tone indoors, café conversation in the café, and one continuous bird bed across the court scenes.
- The worry monster is an editable object in the story. Everything remains local unless you export/download it yourself.
- HTML exports embed the project's audio. MP4 export depends on the browser's supported encoding APIs; use a current Chrome or Edge browser.

## Source layout
- `dist/`: all application HTML, CSS, JavaScript, characters and sounds. Edit these files directly.
- `dist/story-demo.js`: the ten scenes and exact cue timings.
- `dist/quiet-story-renderer.js`: demo actors and performance-key sampling.
- `dist/demo-audio/CREDITS.md` and `dist/AUDIO-CREDITS.md`: recording sources and licenses.
- `tests/`: developer regression checks. These use `@napi-rs/canvas`; the app itself has no npm dependencies.

The ZIP contains source and bundled assets, not your private browser projects, credentials, Git history or hosting configuration. The Windows launcher has been syntax-reviewed but not executed on Windows in this environment.
