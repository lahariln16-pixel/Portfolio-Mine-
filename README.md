# Pondside — An Interactive Portfolio

Pondside is a cinematic, interactive portfolio concept: an ongoing supercar circuit transitions into a quiet, top-down koi pond. The pond becomes the navigation hub, with lily-pad sections, reactive koi, hopping frogs, ripples, day/night lighting, weather controls, and recurring procedural engine ambience.

## Current prototype

- Three.js scene with a stylised circuit, moving cars, shoreline, and pond
- Camera transition from the circuit toward an overhead pond view
- Mouse-sensitive water ripples and koi flee behaviour
- Clickable lily-pad navigation and animated frog hops
- Daylight, golden hour, blue hour, and night presets
- Clear, mist, and rain presets
- Browser-generated engine-like ambience (enable with SOUND ON)
- Reduced-motion control and responsive layout

## Run locally

Because the scene uses JavaScript modules, serve the folder through a local HTTP server rather than opening index.html as a file. For example:

~~~bash
python3 -m http.server 8000
~~~

Then open http://localhost:8000.

## Important notes

- This first pass uses a procedural 3D racing scene and synthesized engine ambience, not a licensed race-video/audio recording yet. A properly licensed race clip can be integrated as the cinematic opening asset in a later pass.
- Portfolio copy is starter content. Update the About, Projects, Skills, and Contact content in src/main.js before publishing as a personal portfolio.
- Three.js and fonts load from CDNs, so the first load requires an internet connection.

## Deployment

The site is static and can be hosted on GitHub Pages or another static host. The feature/pondside-world branch is the development branch; main is not merged or deployed by this work.
