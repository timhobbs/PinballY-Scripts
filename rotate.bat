@echo off
setlocal enabledelayedexpansion
for %%f in (*) do (
    rem echo "fullname: %%f"
    rem echo "name: %%~nf"
    F:\Games\PinballY\ffmpeg\ffmpeg.exe -i "%%f" -vf "transpose=1" "..\%%f"
)