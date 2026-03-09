# Birthday Wish Site (Modern + Themes)

A clean, modern birthday-wish website with:
- Theme switcher (Neon + more)
- Countdown to **5 April** (Asia/Karachi)
- Floating hearts + confetti (canvas)
- Photo gallery (you add your photos)
- Background music toggle

## 1) Edit names + message
Open `index.html` and edit:
- `[Her Name]`
- `[Your Name]`
- the short message text

## 2) Add photos
1. Put your images in: `assets/photos/`
2. Open `js/main.js` and edit:

```js
const PHOTO_LIST = ['p1.jpg','p2.jpg','p3.jpg'];
```

Tip: keep filenames simple (no spaces).

## 3) Add music
Put an MP3 here:

`assets/audio/music.mp3`

Then the **Music** button will work.

## 4) GitHub Pages (hosting)
### Option A (easiest): using GitHub web UI
1. Create a new repo on GitHub (public or private).
2. Upload all files/folders from this project.
3. Go to **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Branch: `main` and folder: `/ (root)`.
6. Save. Wait 1–2 minutes for the link.

### Option B: using git (recommended)
From this folder:

```bash
git init
git add .
git commit -m "Initial birthday site"
# create repo on GitHub, then add remote:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
Then enable Pages as in Option A.

## Themes
Theme CSS files are in `/css`:
- `theme-neon.css`
- `theme-pastel.css`
- `theme-blackgold.css`
- `theme-cutepink.css`
- `theme-minimal.css`

The site remembers the selected theme (localStorage).
