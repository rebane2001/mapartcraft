mkdir img
magick mogrify -filter point -resize 32x32 -path ./img ./img_original/*.png
copy img_original\custom\* img\