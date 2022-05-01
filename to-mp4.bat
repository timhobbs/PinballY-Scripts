@echo off
setlocal enabledelayedexpansion
for %%f in (*.mov) do (
    rem echo "fullname: %%f"
    rem echo "name: %%~nf"
    F:\Games\PinballY\ffmpeg\ffmpeg.exe -i "%%f" -vcodec h264 -acodec mp2 "%%~nf.mp4"
)