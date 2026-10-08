# ReFlex project page

An original, responsive English project website. Static HTML/CSS/JavaScript;
no build service, database, npm installation or external CDN is needed to publish.

## Preview

From the project root, in Anaconda Prompt:

```bat
conda activate mujoco_py310
python -m http.server 8000 --bind 127.0.0.1 --directory website
```

Open `http://127.0.0.1:8000/`. Stop the server with Ctrl+C.

## Publish a dedicated GitHub Pages repository

1. Create a public repository, for example `reflex-project-page`.
2. Upload **the contents of this folder** to the repository root. `index.html`
   must be at the root; do not upload the parent `website` folder as one level.
3. In **Settings > Pages**, select **Deploy from a branch**, then **main** and
   **/(root)**, and save.
4. Once the Pages build finishes, the URL is
   `https://foolscientist.github.io/reflex-project-page/` for the current repository.

All local assets use relative URLs, including fonts and equation rendering,
so the same package works under a GitHub Pages project subpath.
See [the Chinese publishing guide](DEPLOY_ZH.md) for terminal commands.

## Edit project metadata

Edit `site-config.js`:

- `authors`: currently `Shaoyi Wang`.
- `affiliation`: currently `Harbin Institute of Technology`.
- `codeUrl`: the **research code** URL. If empty, GitHub Pages project sites
  automatically link to their hosting repository; local previews omit Code.
- `paperUrl` / `paperLabel`: currently the included **Chinese manuscript** PDF.
- `citation`: a provisional entry with the supplied author, without an invented
  publication venue, arXiv identifier or publication date.

After publishing, optionally replace `og:image` in `index.html` with the full
public URL to `assets/images/collision-released.png` for social sharing.
Custom domains should set `codeUrl` explicitly.

## Refresh media

Run `python website/tools/prepare_assets.py` from the project root using
`mujoco_py310`. It requires the existing ten demonstration videos and paper
assets, plus `imageio_ffmpeg`. It re-encodes web videos, extracts posters and
copies the PDF and progress data; it does not alter scene motion or the paper.
The distributed media are already prepared. This script is not needed to host.

## Framework and constraint comparisons

The hero is followed by the manuscript's original overall framework figure,
copied from `paper/figures/reflex_overall_framework.png`. The diagram is a
conceptual illustration; its object example is separate from the MuJoCo cases.
The Method section keeps a compact, accessible explanation of the repair loop.

`case-constraints.js` contains both stage-level equation sets for each case,
following the manuscript appendix. Each panel shows subgoal and path conditions;
red terms and labelled rows identify wrong references or omitted requirements.
The notes explain preserved conditions, scope and shared notation. Scene D's
incorrect panel includes the intended completion stages, explicitly labelled as
unexecuted by the truncated playback. These are authored specifications, not
recorded model-generated constraints.

## Update the published repository

From this directory, review changes with `git diff`, then commit and push to
`https://github.com/foolscientist/reflex-project-page` on `main`. GitHub Pages
redeploys that branch. Authentication uses Git Credential Manager; never put
passwords or access tokens in website files or Git remotes.

## Scientific scope

- Videos: fixed joint keyframes and scripted rigid object attachment.
- Equations: manually authored explanatory specifications, not solved constraints.
- Correct references are not ReFlex repair outputs.
- Scene A transport ends with the apple still held. Scene D includes release.
- Collision-risk playback stops before contact; the dashed continuation is unplayed.
- Quantitative benchmark targets are intentionally absent from the website.
- The included Chinese manuscript reports the authors' quantitative experimental
  results. The English website is not an English translation of that PDF;
  its authored MuJoCo references remain qualitative illustrations.

Media provenance and hashes are in `assets/data/media-manifest.json`.
Third-party credits and bundled library/font licenses are in
`THIRD_PARTY_NOTICES.md` and `assets/vendor/`.
