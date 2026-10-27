# BEKAMAR Website — VS Code Starter

This is a reorganized version of the supplied Claude HTML prototype.

## Project structure

- `index.html` — page structure
- `css/style.css` — styling and responsive rules
- `js/main.js` — sliders, collections, categories, branches and mobile menu
- `assets/images/` — put approved product, showroom and project images here
- `assets/videos/` — put the final Gemini hero video here

## Run locally in VS Code

1. Extract this folder somewhere convenient.
2. Open VS Code.
3. Choose **File → Open Folder...** and select `bekamar-vscode`.
4. Install the **Live Server** extension if you do not already have it.
5. Right-click `index.html` and choose **Open with Live Server**.

You can also open `index.html` directly in a browser, but Live Server is more convenient while developing.

## Add real images

Put images in `assets/images/` and update the `img` values in `js/main.js`.
For example, use `img: 'assets/images/onyx-crystallo.jpg'` for the corresponding scene/stone entry.
The current prototype uses gradients as placeholders in several areas; replace them with approved real images before publishing.

## Add the hero video

Copy the final video into `assets/videos/bekamar-onyx-hero.mp4`.
The current hero is not yet wired to a video element; the `.hero` section in `index.html` and `renderHero()` in `js/main.js` need to be updated to use the video. Do not expect the video to appear just by copying the file.

## Before publishing

- Replace all `[TELEFON]`, `[E-POSTA]`, `[SAATLER]`, `[Adres]`, `[XX]` and other bracketed placeholders.
- Verify brand names and partnerships before showing them publicly.
- Add the official Bekamar logo as an asset and replace the text-only wordmark in the header/footer.
- Replace placeholder gradients with real product and project photos.
- Test mobile/tablet layouts and all links.
- This is a static HTML/CSS/JS starter, not a backend or CMS.
