from PIL import Image
import os

images = [
    "orderker-icon.png",
    "orderker-logo-full.png",
    "orderker-logo-banner.jpg"
]

base_path = r"e:\OrderKerEcommerceProject7Feb - Copy\expo-ecommerce\mobile\assets\images"

for img_name in images:
    path = os.path.join(base_path, img_name)
    if os.path.exists(path):
        with Image.open(path) as img:
            print(f"{img_name}: {img.size[0]}x{img.size[1]} (Format: {img.format})")
    else:
        print(f"{img_name}: MISSING")
