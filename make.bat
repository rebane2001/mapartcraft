del /S /Q web
rmdir /S /Q web
mkdir web
call create_img.bat
python render_html.py
pause