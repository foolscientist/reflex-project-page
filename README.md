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
   `https://YOUR_USERNAME.github.io/reflex-project-page/`.

All local assets use relative URLs, including fonts and equation rendering,
so the same package works under a GitHub Pages project subpath.
See [the Chinese publishing guide](DEPLOY_ZH.md) for terminal commands.

## Edit project metadata

Edit `site-config.js`:

- `authors`: currently `Shaoyi Wang`.
- `affiliation`: currently `Haerbin Institute of Technology`, as supplied.
- `codeUrl`: the **research code** URL. If empty, GitHub Pages project sites
  automatically link to their hosting repository; local previews omit Code.
- `paperUrl` / `paperLabel`: currently the included **Chinese draft** PDF.
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

## Scientific scope

- Videos: fixed joint keyframes and scripted rigid object attachment.
- Equations: manually authored explanatory specifications, not solved constraints.
- Correct references are not ReFlex repair outputs.
- Scene A transport ends with the apple still held. Scene D includes release.
- Collision-risk playback stops before contact; the dashed continuation is unplayed.
- Quantitative benchmark targets are intentionally absent from the website.
- The included manuscript remains a Chinese draft with anticipated quantitative
  tables explicitly labelled as drafts. The English website is not an English
  translation of that PDF.

Media provenance and hashes are in `assets/data/media-manifest.json`.
Third-party credits and bundled library/font licenses are in
`THIRD_PARTY_NOTICES.md` and `assets/vendor/`.
