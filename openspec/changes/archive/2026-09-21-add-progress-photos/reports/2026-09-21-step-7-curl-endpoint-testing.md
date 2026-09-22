# Step 7 Report - Manual Endpoint Testing with curl

- Date: 2026-09-21
- Change: add-progress-photos (US-026b)
- Agent: GitHub Copilot

## Environment

- Backend on `http://localhost:3000` (`RATE_LIMIT_DISABLED=true`,
  `PHOTO_STORAGE_DIR=/tmp/gym-uploads`), Dockerized PostgreSQL.
- Authenticated cookie via `POST /api/auth/login` (admin).
- Test image generated with `sharp` (32×32 PNG); a `text/plain` file for the
  unsupported-type case. Demo client id = 1.

## Cases and Outcomes

| # | Case | Request | Result |
|---|------|---------|--------|
| 1 | Photo-only create (multipart) | `POST /clients/1/progress` with `photos=@png` | **201**; entry with `photos:[{id,contentType:"image/webp"}]`, all metrics null |
| 2 | Stream photo (authenticated) | `GET /clients/1/progress/1/photos/1` | **200**, `content-type: image/webp`, 76 bytes |
| 3 | Stream photo without auth | same GET, no cookie | **401** |
| 4 | Add photo to existing entry | `POST /clients/1/progress/1/photos` with `photos=@png` | **201**; returns `[{id:2,contentType:"image/webp"}]` |
| 5 | Unsupported type | `POST /clients/1/progress` with `photos=@txt` (text/plain) | **400** (fileFilter) |
| 6 | Empty entry (no metric, no photo) | `POST /clients/1/progress` JSON `{note}` | **400** |
| 7 | Add photo to missing entry | `POST /clients/1/progress/999999/photos` | **404** |
| 8 | Create for missing client | `POST /clients/999999/progress` with photo | **404** |
| 9 | Delete a photo | `DELETE /clients/1/progress/1/photos/1` | **204**; file removed from disk (2 → 1 files) |
| 10 | Delete the same photo again | repeat DELETE | **404** |
| 11 | Delete the entry | `DELETE /clients/1/progress/1` | **204**; remaining photo file removed (dir empty) |
| 12 | DB after cleanup | count rows | `ProgressEntry=0`, `ProgressPhoto=0` |

## Notes

- Uploads are stored as generated uuid `.webp` filenames (observed:
  `4f160775-…​.webp`, `8c114392-…​.webp`) — never a client-supplied path.
- Deleting a photo removes both the row and the on-disk file; deleting an entry
  removes its remaining files (verified the `/tmp/gym-uploads` directory emptied)
  and cascades the rows.
- All uploaded images were re-encoded to `image/webp` (EXIF stripped) regardless
  of the input PNG.

All curl cases passed. Test artifacts and uploaded files were cleaned up.
