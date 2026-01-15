from celery import shared_task
from PIL import Image
from django.core.files.base import ContentFile
from .models import Photo
import io

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5)
def process_photo(self, photo_id):
    photo = Photo.objects.get(id=photo_id)

    try:
        img = Image.open(photo.image)

        img.thumbnail((400, 400))
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG")

        photo.thumbnail.save(
            f"thumb_{photo.id}.jpg",
            ContentFile(buffer.getvalue()),
            save=False
        )
        photo.watermarked = True
        photo.status = "done"
        photo.save()

    except Exception:
        photo.status = "failed"
        photo.save()
        raise

@shared_task
def test_task():
    print("✅ Celery task executed")
    return "done"
