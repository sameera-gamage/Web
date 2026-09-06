#!/usr/bin/env bash
# Encode a hero clip for scroll-scrubbing: ALL-INTRA (a keyframe on every frame)
# so any seek decodes exactly one frame — the smoothest possible scrub.
# Usage:  ./encode-hero.sh master.mp4 hero
# Produces hero-720.mp4/.webm and hero-480.mp4/.webm (mp4 = h264, webm = vp9),
# no audio, faststart (moov atom up front) so playback/seeking start immediately.
set -e
SRC="${1:?source video}"; OUT="${2:-hero}"

mp4 () { # $1=height $2=crf
  ffmpeg -y -i "$SRC" -an -vf "scale=-2:$1" \
    -c:v libx264 -crf "$2" -preset slow -g 1 -keyint_min 1 -x264-params scenecut=0 \
    -pix_fmt yuv420p -movflags +faststart "${OUT}-$1.mp4"
}
webm () { # $1=height $2=crf  (keep webm <= mp4 size; it is listed first)
  ffmpeg -y -i "$SRC" -an -vf "scale=-2:$1" \
    -c:v libvpx-vp9 -crf "$2" -b:v 0 -g 1 -keyint_min 1 \
    -deadline good -cpu-used 2 -row-mt 1 -pix_fmt yuv420p "${OUT}-$1.webm"
}

mp4  720 20;  webm 720 35
mp4  480 20;  webm 480 34

echo "verify every frame is a keyframe (keyframes should equal total frames):"
for f in "${OUT}"-*.mp4 "${OUT}"-*.webm; do
  kf=$(ffprobe -v error -select_streams v:0 -show_entries frame=key_frame -of csv=p=0 "$f" | grep -c '^1')
  echo "  $f  keyframes=$kf"
done
# GOP 1 = smoothest, ~2x size. For a lighter file use -g 2 -keyint_min 2 (still very smooth).
