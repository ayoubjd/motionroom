# Motionroom Animation Studio

For the downloadable edition, start with **START-HERE.md**. The default demo is **One More Try**, ten scenes / 92 seconds, with editable ambience and action audio.

A dependency-free browser animation editor built with HTML, CSS, JavaScript and Canvas 2D.

## Features

- Character library with Milo and configurable presets across classic, paper, ink, robot, cat and bear styles. Paper Boy is hidden from the active library.
- Avatar editor using one procedural rig: selectable head shapes, hairstyles, skin/hair/clothing/shoe colors, eight outfits and accessories; live front/side/back previews and movements.
- 62 procedural shapes, props and characters; editable color and transforms.
- Independent key frames with duration, duplicate/blank, drag reorder, onion skin and optional interpolation.
- Marquee and Shift selection, grouping, move/scale/rotate, layers, lock and visibility.
- Articulated character with editable shoulders, elbows, hips, knees, body and head; 20 movement presets plus custom posing, 14 emotions, and a rebuilt profile view.
- Front, side and back views; a multi-character PNG creator with silhouette-based automatic placement of 15 editable joints per view, a layered body-part editor, adjustable motion strength, live movement previews, and reusable saved characters.
- Distance-based freehand motion paths, camera keys at arbitrary times within each frame, shot presets, and character following with body-to-face zoom.
- Persistent dark / light UI themes.
- Audio tracks below the storyboard with a shared time ruler, waveform clips, drag-and-drop placement, edge trimming, splitting, multiple rows, volume, mute, looping and fades. Includes 10 synthesized effects and audio uploads. Existing frame sounds migrate automatically.
- IndexedDB autosave, portable .motionroom JSON projects including images, undo/redo.
- Offline animated HTML export and native WebCodecs H.264 + AAC MP4 export at 720p or 1080p.
- MediaRecorder fallback uses MP4 when supported; otherwise explicitly exports WebM. Sound effects are included in both export formats.

## Run

Serve the `dist` directory through any static web server, for example `python3 -m http.server 8000 --directory dist`, and open http://localhost:8000. No build or package installation is required. H.264 encoding requires a secure context and a supported browser/device. Recent Chrome or Edge is recommended. Optional Google Fonts fall back to local fonts if offline.

## Rendering and editing

`engine.js` is the shared deterministic animation renderer. `app.js` contains editor state and interaction, and embeds the renderer into downloaded standalone HTML scenes. `motions.js` provides PNG rigging, poses, props and camera evaluation; `rigging.js` provides silhouette auto-rigging and skeleton transforms; `puppet.js` renders complete rigid parts and retargets motion presets; `character-builder.js` implements reference-joint editing, part PNG imports with Root/End anchors, source polygon cutouts, layer ordering and preview playback; `audio.js` schedules timeline clips and renders the offline audio mix. `timeline-audio.js` implements the shared scene/audio timeline. `studio-v2.js` extends the editor UI. `mp4.js` builds ISO BMFF video/audio tracks from WebCodecs H.264 and AAC samples. `style.css` and `index.html` define the editor UI.

Custom characters now use a layered puppet, not nearest-bone pixel splitting or mesh deformation. Existing source images and manually placed joints are preserved. All ten parts rotate as rigid images using two attachment points and uniform scale. Automatic mode retains the head image and reconstructs solid torso and limb shapes from the source colors, with overlapping endpoints to avoid tearing. This deliberately simplifies the drawing. For faithful clothing, patterns and silhouettes, replace a part with an isolated PNG or use a polygon cutout from the reference; adjust its Root/End anchors in the part preview. Artwork hidden in the reference must be supplied as a separate part. Per-part width and color controls, draw order and live walk/run previews are available. Front/back movement uses a marching gait; side movement requires an uploaded side view. Missing views no longer pretend to be side artwork.

The Original PNG animation method preserves the image exactly for path movement. It does not articulate the body. Milo continues to use the procedural character renderer and remains available. PNG facial expressions stay part of the uploaded artwork. All custom parts, anchors and settings persist in project JSON/IndexedDB and are embedded in standalone HTML/video rendering.

The user's reference video could not be viewed in the build environment; the editor is based on the requested feature set. The supplied paper character’s three reference PNGs are included in `dist/characters/paper-boy.json`; the library loads them on demand and prepares calibrated cutout attachments once. The reference artwork stays embedded in saved projects.

## Verification

Node syntax checks; deterministic frame boundary, immutable sampling, camera/object tween and path-distance tests; render checks for every prop and 120 pose/view/emotion combinations; visual inspection of a demo frame and asset contact sheet. MP4 muxer tested with real H.264 video and stereo 48 kHz AAC audio, both successfully probed/decoded by ffprobe/ffmpeg. Camera key interpolation, path-following body-to-face framing, 882 movement/view/emotion combinations, PNG mesh/cutout rendering and all ten synthesized effects checked. A lightweight DOM harness (not a browser) checks startup, dark mode, sound controls, PNG upload, character creation, project roundtrip and camera controls. Generated standalone HTML scripts parsed and embedded data escaping checked. Full browser interaction and on-device WebCodecs encoding were not available in this environment.

Version 4 regression checks cover 6,000 fixed bone-length checks across multiple views and source padding, complete generated limb endpoints, imported part anchor alignment, unchanged reference data, exact Original PNG mode, and legacy audio migration. Native Canvas walking/running cycle contact sheets were visually inspected. Editor-handler tests cover separate-part import, anchor dragging, polygon extraction, playback scrubbing, project roundtrips and standalone HTML export, plus existing audio/camera flows. Browser layout and live browser playback remain unverified.

Run `node tests/rig-and-audio.cjs` with `@napi-rs/canvas` available to Node (for example via `NODE_PATH`) to repeat the rig/audio regression checks.

## Version 5 performance

Playback owns one cancellable animation callback and previews at up to 30 fps. The stage render buffer follows its displayed size (640–1440 px wide); MP4/HTML exports retain their configured resolution. Pointer and idle draw requests coalesce to animation frames. Thumbnails cache by frame and character revision; unchanged selection refreshes reuse them. Undo snapshots reuse immutable image/audio strings instead of JSON-encoding them repeatedly. Camera-wheel gestures commit one undo snapshot and defer thumbnail/inspector refresh until the gesture ends. Puppet caches use weak references rather than serializing joint arrays each render, and all-custom puppets skip unused generated parts. Shared body-part source images are deduplicated before awaiting decoding, preventing a loading deadlock.

Tests check 20 rapid play/pause cycles leave exactly one playback loop, unchanged UI refreshes reuse thumbnails, avatar options survive project roundtrips, standalone HTML executes with avatars, and 1,197 avatar pose/view combinations render with finite joint positions. Native Canvas contact sheets of the complete cast and all three uploaded character views were inspected. Full browser performance and interaction testing remain unavailable in this environment.

## Shared-head characters and direction update

- Path playback uses each segment's travel direction and turns character side views left or right. Disable “Face the direction of travel” in Properties for manual Flip control. Zero-length segments and vertical stretches do not cause random flips.
- Characters → Upload 3 head views uses the avatar body and rig. Supply front, side and back heads, set the side image's original facing, and optionally adjust head size and vertical position. Transparent borders are trimmed once on upload; images are embedded in saved projects and HTML exports. Uploaded expressions stay in the artwork.
- Paper boy now uses the supplied head images on the shared body. Existing built-in Paper boy definitions migrate on project loading or library opening; existing other PNG puppets remain editable.
- Side-view hair fits the side head profile. Added ponytail, braids, afro, mohawk and wavy hair; vest, coat, cardigan, polo and dungaree dress; sunglasses, bow, crown, bandana, earrings, necklace, backpack and tie.
- Validation: native Canvas render/rig tests, bidirectional path and migration tests, editor handler tests for three-image upload and project roundtrip, standalone HTML execution. Full browser layout/performance QA was unavailable.

## Colors, expressions, reusable objects and places

- Avatar customization accepts arbitrary hex colors through native color pickers for skin, hair, clothes, trousers/details and shoes. Existing preset swatches remain available.
- Uploaded front/side heads now support the expression selector and talking/sleeping poses. A cached image patch covers drawn eyes/brows/mouth, and procedural features are positioned over it. Customize → Uploaded face expressions adjusts each view's horizontal position, eye/mouth heights, width, coverage, ink and optional cover color. Neutral retains original artwork; the toggle disables replacement altogether. Back heads remain unchanged. Arbitrary artwork may require manual placement and color adjustment.
- Custom tab: save a selected group as one composite object, add independent reusable copies, or build/edit artwork on an isolated canvas. Drag, color, resize, rotate, layer, duplicate, delete and undo parts. Library definitions and their source parts are retained in project files. Editing a placed instance creates a new library item and updates that instance; existing other copies stay unchanged.
- Places tab: Bedroom, Kitchen, Bathroom / toilet, Street, Inside shop, Office, Classroom, Living room and Park. Each inserts a new editable frame after the current frame.
- Shared renderers support composites and head expressions in scene playback and HTML/video export. Checks cover persistence, nested character rendering, facial pixel changes, group creation, custom canvas saving, all nine template renders, and standalone HTML execution. Browser layout QA remains unavailable.

## Object motion, effects, drawing and short frames

- Select an object → Object animation: shake, rotate, float, pulse, bounce, swing; fade, pop, bounce, directional slide and spin entrances; fade, shrink and slide exits. Controls set speed, amount, delay and duration. Effects restart per frame, combine with motion paths, and render in HTML/video exports.
- Visual effects: glow, discovery rays, snoring Zs, ringing waves, smell trails, dark aura, spotlight and lamp light. Multiple effects can be combined. Intensity, color and size are editable. Spotlight/lamp effects darken the surroundings while following the object. These effects do not add audio; use the existing audio timeline for sound.
- Objects → search “Shadow monster”: layered dark silhouette, red paper-like edge, pale eyes and editable label, based on the supplied reference.
- Pen tool (B): smooth quadratic freehand strokes on any frame. Each stroke is editable as an object and supports grouping, animation, duplication and undo. Stroke points remain vector data in saved projects.
- Timeline frames have a minimum width of 84 pixels. The ruler, audio positions, waveform sampling, dragging, trimming and playhead use the same expanded time mapping. Durations are unchanged. Very short frames show frame-count and seconds labels.
- Validated with native Canvas effect renders, all preset combinations, handler tests for pen persistence, minimum frame targets, inverse time mapping, audio drag across a short frame, and standalone HTML execution. Browser layout testing remains unavailable.

## Expanded creative library and mouse transforms

- Removed both text labels from the original shadow monster, including existing copies. Added eight new monster designs.
- Added 129 objects (192 total), including 15 POV hands/held-object poses, kitchenware, food, bathroom/cleaning tools, office/school equipment, nature props, vehicles and everyday objects. The Objects library now has category filtering, search and 48-item pages.
- Added 64 deterministic synthesized sound effects (74 total). Search and category filtering cover UI, Foley, Weather, Ambience, Cinematic, Magic and Cartoon. Sounds are generated locally; they are stylized synthesis rather than recorded natural Foley. Sources remain compatible with timeline editing and exports.
- Added 24 visual effects (32 total): sparkles, hearts, sweat, tears, anger, question, idea bulb, speed lines, impact, dizzy stars, smoke, fire, rain, snow, bubbles, confetti, leaves, electricity, shield, ripple, dust, steam, target and warning.
- Added 20 location templates (29 total), including five POV compositions and café, restaurant, hospital room, library, science lab, workshop, garage, bus stop, campsite, beach, mountains, cinema, gym, airport and supermarket. All constituent objects are editable.
- Custom object canvas: corner handles resize, the round handle rotates, drag moves; Shift preserves resize proportions / snaps rotation, Shift-click and marquee select multiple parts. Selected parts transform together. Wheel zooms at the pointer, middle-button drag pans, and Fit restores the artwork view. Delete and Ctrl/Cmd+Z work inside the canvas.
- Checks: native renders of all additions, unique asset IDs, finite non-silent audio with bounded peaks, all effect renders, all template project validation, mouse resizing/rotation/multiselect handlers, saving and standalone HTML playback. Full browser interaction QA remains unavailable.

## Custom places and frame lighting
Custom canvas now supports Save as → Place template, a fixed 16:9 stage and background color. Saved places live in the project's Places library, can be reopened for editing, and insert as independent location frames with grouped native objects. Ungroup exposes individual parts; editing an inserted copy does not alter its template. Libraries persist in project JSON and autosave.

Frame properties include a live 0–160% light slider and Dark/Medium/Normal/Bright presets. Lighting is rendered in the shared engine for preview, thumbnails, HTML and video exports, and interpolates when tweening is enabled. Tests cover template roundtrips, independent copies, ungrouping, slider handlers, rendered brightness and tween interpolation. Browser layout testing was unavailable.

## Scene atmosphere and workspace controls
Frame-level sceneEffects supports rain, snow, wind, fog, dust, leaves, confetti and stars without placeholder objects. Density, speed and direction controls are in Properties → Effects. Bounded deterministic particle rendering is shared by preview and exported video/HTML.

Compact headers and a 220px default timeline leave more space for the scene. Workspace zoom is adjustable from 50–300%, with scrollbars for enlarged artwork; it does not change the camera. Timeline height can be adjusted from 160–420px. Both sidebars collapse and restore, library tabs use an aligned grid, and property tabs filter Object/Frame/Camera/Effects sections. Avatar clothing now includes None, rendering the same stylized body and feet in the selected skin color.

Handler and native-canvas checks passed for the new atmosphere, inspector navigation, panel toggles, timeline resizing, viewport/camera separation and body-only views. Browser layout QA remains unavailable.

## Productivity storytelling pack
Added 50 vector props in Productivity, 12 object effects for focus/distraction/progress/energy, and 12 additional scene effects (20 scene-wide options total). All draw through shared export engines. The editor tool strip now occupies a horizontal row in normal document flow above the canvas; it cannot overflow over the timeline's Play button. Place creation and template action buttons wrap within their sidebar widths.

Native-canvas renders and handler regression checks passed, including empty-scene weather, the complete productivity object pack, and object effects. Browser layout verification remains unavailable.

## Effect attachment, compact tools, and gaze
Object effects share one anchor-and-scale wrapper. Reaction effects attach near the animated head; users can select auto/head/body anchors and X/Y offsets. Effect size scales each entire procedural effect. The left toolbar is a contained two-column, scrollable rail, with compact scene and workspace control rows. Paper Boy is no longer offered in the character library; existing saved instances are retained for project compatibility.

Characters have nine per-frame gaze directions. Shared faces, robot avatars, and enabled imported-head expression overlays support gaze; back views and closed eyes stay visually appropriate. Automated controls/persistence checks and rendered comparisons passed for gaze and effect sizes. Full browser layout QA remains unverified.

## Project menu, ADHD story demo, and portrait format
Eye direction now follows Character performance. Project groups New, Open and Save in a dropdown. First-run users receive the editable 66-second, 13-scene “ADHD · One small step” story, with a paper-card theme, captions, character gestures/gaze, motion path, camera keys/tracking, effects, lighting, a freehand underline, groups, reusable libraries and 20 timed audio cues. Existing autosaved projects are restored as before. The provided YouTube reference could not be retrieved, so exact style matching was not verified.

Format switches between 16:9 landscape and 9:16 portrait. Portrait is a narrower camera view of the same world, with no object deformation. Existing scenes may require camera reframing. Editor picking/selection/panning, canvas resizing, thumbnails, shared rendering, MP4 and recording dimensions, and standalone HTML use the project format. Portrait export offers 720×1280 and 1080×1920. Tests cover project format, undistorted geometry, output dimensions, menu interaction, gaze ordering and the demo storyboard. Browser UI and actual browser codec execution remain unverified.

## Night-story reference update
Replaced the paper-card demo with a 72-second, 13-scene original ADHD story using near-black rooms, pale rounded shared-rig characters, warm desk lighting, a shadow metaphor, a POV phone and street facades. Reference screenshots were inspected; the supplied .gif was actually a single-frame 320×180 PNG, so temporal motion could not be extracted. Added 10 reusable Night story vector objects and four cached synthesized sounds; added modules to standalone exports.

Startup always keeps the new demo open. Existing IndexedDB work is read into Resume saved project under Project rather than replacing the demo automatically. Opening the demo alone does not overwrite the saved current project; editing/saving a project continues to use the normal current-project autosave. Tests cover startup with saved content, non-silent new and old synthesis, demo validation/rendering, and export-script inclusion. Native storyboard rendering was inspected. Browser layout and actual browser codec checks remain unavailable.


## Editor revision 16
Rotated single-object resizing now uses local corners, including mirrored objects. Custom canvas text measures glyph bounds. Clocks, digital clocks and shop signs expose editable content; eye state has explicit movement overrides. New blank frames use 0.2 seconds. Compact workspace and Focus mode enlarge editing space. The 72-second demo now uses 39 acting frames in 13 scenes, with recorded CC0 foley and a redesigned shadow. Sound provenance is in dist/AUDIO-CREDITS.md.

Validation: regression harness exercises 40 rotated/mirrored pointer gestures, glyph pixels, prop settings, eye state, 0.2-second creation, focus restoration, recorded sound assets, demo interpolation and portable HTML. Managed browser layout and browser MP4 codec execution were unavailable.


## Default demo revision 17 — Catch That Idea
The default project is a new 52.2-second chase story: a runaway idea, stormy city, worry shadow, helpful friend, folded paper rocket and a hopeful launch. Twenty shots contain sixty editable acting frames (each at most one second), motion paths, preset and custom poses, expressions, camera following and face zoom, grouped props, freehand creases, changing lights, 23 object effects and 15 scene/weather effects.

Nineteen downloaded CC0 audio files live in `dist/demo-audio/`; source credits are in that folder. `demo-sound-assets.js` is a private manifest, never registered with the sound shelf. The demo stores its soundtrack in `demoAudio`, separate from user library assets and editable audio rows. The normal library and timeline are unchanged. Demo playback and video export resolve these local files; saved projects and HTML exports embed them for offline portability. One in-flight request/decode per unique recording avoids redundant audio work.

Checks: `tests/demo-story.cjs` verifies motion in every frame, effects coverage, 105 recording-only cues, hidden assets, deduplicated loading and portable packaging. The editor regression harness also verifies the actual demo HTML export. Native Canvas storyboard inspected. Browser playback and browser MP4 codec execution remain unverified in this environment.


## Default demo revision 18 — readability and sound edit
Re-edited Catch That Idea to 11 sustained shots / 33 acting frames / 68.5 seconds. Shot lengths are 4.5–7 seconds; character gait runs at 65% of its former speed. Anticipation precedes the note lift and plane release. Reduced visual clutter, continuous weather phases, and smaller reaction movements prevent repeated micro-frame resets from feeling like cuts.

Rebuilt the hidden soundtrack: 40 cues, down from 105. Two quiet continuous rain/bird beds span whole locations. Only concrete action sounds remain: measured foot-contact phases, paper lift/fold/crease, plane release and the puddle landing. Removed decorative wind bursts, thuds, creaks and repeated cloth. Added Luckius paper recordings and rubberduck splash (CC0), cleaned/softened existing footsteps and made seamless ambience loops; credits remain in dist/demo-audio/CREDITS.md. The demo uses 12 edited files, hidden from the library.

Checks: per-frame motion, sustained shot lengths, portable hidden audio, cue limits, timing and native Canvas storyboard; full editor/export regression. Browser playback/MP4 codec execution remains unverified.
