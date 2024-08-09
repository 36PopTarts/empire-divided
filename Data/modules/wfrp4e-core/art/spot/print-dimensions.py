from PIL import Image
import os


def imageSize(img):
    return img.size[0] * img.size[1]

images = []
for file in os.listdir():
    if (os.path.isfile(file) and (file.endswith(".png") or file.endswith(".jpg") or file.endswith(".jpeg") or file.endswith(".webp"))):
            images.append(Image.open(file))

images.sort(key=imageSize)

for img in images:
   print(img.filename + " " + str(img.size))

