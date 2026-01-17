from celery import shared_task
import piexif
from django.core.files.storage import default_storage
from .models import Photo
import logging

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
    with default_storage.open(photo.image.name, "rb") as f:
        image_bytes = f.read()

    exif = piexif.load(image_bytes)
    model = exif["0th"].get(piexif.ImageIFD.Model)
    photo.camera_model = model.decode(errors="ignore") if model else None
    fnumber = exif["Exif"].get(piexif.ExifIFD.FNumber)
    if fnumber:
        photo.aperture = f"f/{round(_rational_to_float(fnumber), 1)}"
    exposure = exif["Exif"].get(piexif.ExifIFD.ExposureTime)
    if exposure:
        photo.shutter_speed = f"{exposure[0]}/{exposure[1]} sec"
    gps = exif.get("GPS")
    if gps:
        lat = _convert_gps(
            gps.get(piexif.GPSIFD.GPSLatitude),
            gps.get(piexif.GPSIFD.GPSLatitudeRef),
        )
        lon = _convert_gps(
            gps.get(piexif.GPSIFD.GPSLongitude),
            gps.get(piexif.GPSIFD.GPSLongitudeRef),
        )
        if lat is not None and lon is not None:
            photo.gps_Location = f"{lat}, {lon}"
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
