from celery import shared_task
import piexif
from django.core.files.storage import default_storage
from .models import Photo
import logging
from io import BytesIO
from .ml_tagging import predict_tags
from PIL import Image


logger=logging.getLogger(__name__)

def _rational_to_float(r):
    return r[0] / r[1] if r and r[1] != 0 else None


def _convert_gps(coord, ref):
    if not coord or not ref:
        return None

    d = _rational_to_float(coord[0])
    m = _rational_to_float(coord[1])
    s = _rational_to_float(coord[2])

    decimal = d + (m / 60.0) + (s / 3600.0)
    if ref in [b"S", b"W"]:
        decimal = -decimal

    return round(decimal, 6)


@shared_task(bind=True, autoretry_for=(Exception,), retry_kwargs={"max_retries": 3, "countdown": 5})
def extract_exif_and_update(self, photo_id):
    photo = Photo.objects.get(id=photo_id)

    photo.status = "processing"
    photo.save(update_fields=["status"])
    image_bytes = photo.image.read()

    exif = piexif.load(image_bytes)

    model = exif["0th"].get(piexif.ImageIFD.Model)
    if model:
        photo.camera_model = model.decode(errors="ignore")

    fnumber = exif["Exif"].get(piexif.ExifIFD.FNumber)
    if fnumber:
        photo.aperture = f"f/{round(fnumber[0] / fnumber[1], 1)}"

    exposure = exif["Exif"].get(piexif.ExifIFD.ExposureTime)
    if exposure:
        photo.shutter_speed = f"{exposure[0]}/{exposure[1]} sec"

    gps = exif.get("GPS", {})
    if gps:
        photo.gps_Location = "GPS available"  # optional: convert later

    photo.status = "done"
    photo.save(
        update_fields=[
            "camera_model",
            "aperture",
            "shutter_speed",
            "gps_Location",
            "status",
        ]
    )

    return photo.id
@shared_task(bind=True, autoretry_for=(Exception,), retry_kwargs={"max_retries": 2, "countdown": 10})
def generate_ai_tags(self, photo_id):
    photo = Photo.objects.get(id=photo_id)
    with default_storage.open(photo.image.name, "rb") as f:
        image_bytes = f.read()

    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    tags = predict_tags(image)
    photo.ai_tags = tags
    photo.save(update_fields=["ai_tags"])
    logger.info("Tags generated: %s", tags)
    return tags