# Asset and dependency credits

The page layout, HTML, CSS and interaction code were created for this project;
no academic website template was copied.

## Simulation assets

- MuJoCo: <https://mujoco.org/>.
- Franka Panda model: Google DeepMind MuJoCo Menagerie,
  <https://github.com/google-deepmind/mujoco_menagerie>. The project uses the
  existing Panda asset installation and scene scripts.
- Scanned apple, pear and spatula: Yale-CMU-Berkeley Object and Model Set (YCB),
  <https://ycb-benchmarks.s3.amazonaws.com/index.html>.
  Authors: Berk C. Calli, Arjun Singh, Aaron Walsman, Siddhartha Srinivasa,
  Pieter Abbeel and Aaron M. Dollar. YCB assets are credited under CC BY 4.0,
  as recorded in the project's asset documentation.
- ReKep background: <https://rekep-robot.github.io/>. The people credited on the
  upstream ReKep README are not presented as ReFlex authors.

## Bundled browser dependencies

- KaTeX: <https://katex.org/>, MIT. Distribution CSS, JavaScript and fonts are
  bundled in `assets/vendor/katex/`, together with the package license.
- DM Sans and Newsreader: font distributions from `@fontsource/dm-sans` and
  `@fontsource/newsreader`, SIL Open Font License 1.1. Font files are bundled
  locally; licenses are included in `assets/vendor/`.

Library and font versions are recorded in `assets/vendor/versions.json`.
The media manifest records the original source paths, source hashes and
website media hashes. These are authored demonstrations, not benchmark runs.
