import io
import numpy as np
from PIL import Image, ImageOps, ImageFilter
from typing import Dict, Any, Tuple

class ImageQualityAssessment:
    @staticmethod
    def assess_image(image_bytes: bytes) -> Tuple[str, Dict[str, Any]]:
        """
        Assesses image quality for blur, extreme darkness/brightness, and minimal readable resolution.
        Returns (status: 'good' | 'poor' | 'unreadable', details: dict)
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image = ImageOps.exif_transpose(image) # handle phone rotation
        except Exception as e:
            return "unreadable", {
                "error": f"Invalid image format: {str(e)}",
                "is_unreadable": True,
                "is_blurry": True,
                "is_too_dark": False,
                "is_cropped": True
            }

        width, height = image.size
        if width < 150 or height < 150:
            return "unreadable", {
                "error": "Image resolution too low to extract text (min 150x150)",
                "width": width,
                "height": height,
                "is_unreadable": True,
                "is_blurry": False,
                "is_too_dark": False
            }

        # Convert to grayscale for analysis
        gray = image.convert('L')
        np_gray = np.array(gray, dtype=np.float32)

        # 1. Brightness / Lighting Check
        mean_brightness = float(np.mean(np_gray))
        is_too_dark = mean_brightness < 45.0
        is_overexposed = mean_brightness > 245.0

        # 2. Blur / Sharpness Check using discrete Laplacian filter on numpy
        # Laplacian kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
        # Compute difference with 4-neighborhood
        padded = np.pad(np_gray, ((1, 1), (1, 1)), mode='edge')
        laplacian = (
            padded[:-2, 1:-1] +
            padded[2:, 1:-1] +
            padded[1:-1, :-2] +
            padded[1:-1, 2:] -
            4 * np_gray
        )
        laplacian_var = float(np.var(laplacian))

        # Typical sharp document has variance > 100. < 40 is severely blurry.
        is_blurry = laplacian_var < 50.0

        # 3. Crop / Aspect ratio heuristic: extreme ratios (> 8:1)
        aspect_ratio = max(width, height) / max(1, min(width, height))
        is_severely_cropped = aspect_ratio > 8.0

        details = {
            "width": width,
            "height": height,
            "mean_brightness": round(mean_brightness, 1),
            "laplacian_variance": round(laplacian_var, 1),
            "is_blurry": is_blurry,
            "is_too_dark": is_too_dark,
            "is_overexposed": is_overexposed,
            "is_severely_cropped": is_severely_cropped,
            "issues": []
        }

        if is_blurry:
            details["issues"].append("The prescription image is too blurry to read reliably. Please capture a clearer image.")
        if is_too_dark:
            details["issues"].append("The prescription image is too dark. Please take the photo in better lighting.")
        if is_overexposed:
            details["issues"].append("The prescription image is washed out by glare or bright light.")
        if is_severely_cropped:
            details["issues"].append("The prescription appears heavily cropped or incomplete.")

        if is_blurry or is_too_dark or is_severely_cropped:
            status = "poor" if len(details["issues"]) == 1 and not is_blurry else "unreadable" if is_blurry and laplacian_var < 20 else "poor"
        else:
            status = "good"

        return status, details
