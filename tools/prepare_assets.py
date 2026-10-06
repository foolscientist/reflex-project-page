"""Prepare a self-contained static site from existing authored MuJoCo outputs.

Run in mujoco_py310. Scene motion and paper sources are not changed.
Browser videos are re-encoded in H.264 with faststart. Provenance stays local
to the site as a downloadable JSON manifest, distinct from benchmark results.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "website"
ASSETS = SITE / "assets"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
CASES = {
    "object": ("scene_a_pick_place/object_binding", False, 5.5),
    "region": ("scene_b_functional_region/keypoint_binding", False, 6.2),
    "direction": ("scene_c_top_down_approach/approach_direction", True, 3.0),
    "progress": ("scene_a_pick_place/progress_stagnation", False, 11.0),
    "collision": ("scene_d_obstacle_avoidance/collision_risk", True, 9.0),
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    for folder in ("videos", "images", "data", "paper"):
        (ASSETS / folder).mkdir(parents=True, exist_ok=True)
    manifest = {"data_status": "scripted_qualitative_illustration", "runtime_planning": False,
                "constraint_origin": "manually_written_specification_examples", "media": []}
    for name, (scene, detail, at) in CASES.items():
        for side in ("correct", "wrong"):
            source = ROOT / "paper/mujoco_demo/outputs" / scene / "videos" / f"{side}{'_detail' if detail else ''}.mp4"
            target = ASSETS / "videos" / f"{name}-{side}.mp4"
            subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", str(source), "-an",
                            "-vf", "scale=960:-2", "-c:v", "libx264", "-crf", "23", "-preset", "medium",
                            "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(target)], check=True)
            poster = ASSETS / "images" / f"{name}-{side}.jpg"
            subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-ss", str(at), "-i", str(target),
                            "-frames:v", "1", "-q:v", "2", str(poster)], check=True)
            manifest["media"].append({"case": name, "side": side, "source": str(source.relative_to(ROOT)),
                                      "source_sha256": sha(source), "video_sha256": sha(target),
                                      "poster_time_s": at, "poster_sha256": sha(poster)})
        print("Prepared", name, flush=True)
    for filename in ("mujoco_progress_distance.png", "mujoco_progress_correct.csv", "mujoco_progress_wrong.csv"):
        target_folder = "images" if filename.endswith(".png") else "data"
        shutil.copy2(ROOT / "experiments/figures" / filename, ASSETS / target_folder / filename)
    shutil.copy2(ROOT / "experiments/figures/mujoco_case_panels/collision_released.png",
                 ASSETS / "images/collision-released.png")
    shutil.copy2(ROOT / "paper/main.pdf", ASSETS / "paper/reflex-manuscript-zh.pdf")
    (ASSETS / "data/media-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("Prepared manuscript, progress data and media provenance.")


if __name__ == "__main__":
    main()
