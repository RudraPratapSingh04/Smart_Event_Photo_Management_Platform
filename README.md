PhotoGo
=======

PhotoGo is an event-focused photo management and sharing application. It provides flexible gallery views, a focused image viewer, real-time activity, and tools for photographers to manage events and assets.

What PhotoGo offers
- Gallery views: grid, masonry, and date-wise grouping for fast browsing.
- Focused image viewer: two-column layout showing the image and a details panel with actions and metadata.
- Likes and favourites: like photos and mark them as favourites.
- Tagging and comments: tag users in photos and add comments; both support real-time updates.
- Real-time notifications: WebSocket-based notifications for likes, tags, comments, and other activity.
- Profile management: profile picture, bio, and basic account info.
# PhotoGo

PhotoGo is an event-focused photo management and sharing application. It provides flexible gallery views, a two-column focused viewer, real-time activity, and tools for photographers to manage events and assets.

## Highlights

- Flexible gallery views: grid, masonry, and date-wise grouping.
- Two-column viewer: image plus details panel with actions and metadata.
- Interactions: likes, favourites, tagging, and comments.
- Real-time notifications via WebSockets (Django Channels).
- Background AI tag generation (Celery) and EXIF extraction.

## Tech stack

- Frontend: React + Vite
- Backend: Django + Django REST Framework
- Real-time: Django Channels
- Background jobs: Celery (Redis)
- Storage: AWS S3

## Getting started (development)

1. Create and activate a Python virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\activate
```

2. Install backend dependencies:

```bash
pip install -r requirements.txt
```

3.Start a broker and a Celery worker:

```bash
redis-server
celery -A myproject.celery worker --loglevel=info
```

4. Run migrations and start the Django server:

```bash
python manage.py migrate
python manage.py runserver
```

5. Start the frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

## Useful commands

- Run backend tests: `python manage.py test`
- Run frontend dev: `cd frontend && npm run dev`
- Build frontend assets: `cd frontend && npm run build`
- Start Celery worker: `celery -A myproject.celery worker --loglevel=info`

## API & features (summary)

- Authentication: OTP registration and Omniport/OAuth entry points.
- Photos: upload, download, properties, search, favourites, and tags.
- Events: create/update/delete events and manage per-event upload access.
- Interactions: `toggle_like`, `toggle_favourite`, `add_comment`, `tagUser` (with optional WebSocket notifications).
- AI tags: background task that generates and stores `ai_tags` on the `Photo` model.

## Watermarking
- On upload, a background Celery task generates a watermarked JPEG containing the uploader's username and stores it.
- Guests  receive the watermarked image when they download a photo; members and other users receive the original image.
- Watermark generation is asynchronous (Celery) and non-blocking; if watermarking fails the upload still completes and the original image remains available.

## Real-time behavior

Notifications are sent through Channels to per-user groups. The client connects via WebSocket to receive toast notifications and the notification list.

## Contributing

Fork the repo, create a feature branch, add tests, and open a pull request describing your changes.

## Contact

Open an issue with reproduction steps and logs for support or feature requests.

## Author
Rudra Pratap Singh