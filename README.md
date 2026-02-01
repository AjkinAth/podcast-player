# Podcast Player 🎧

A fully client-side **Podcast Player web app** built with **HTML, CSS, and Vanilla JavaScript**.  
The app lets users search for podcasts, browse episodes, play audio, manage a listening queue, and save favourites — all with persistent state using `localStorage`.

## ✨ Features

- 🔍 **Search podcasts** by title
- 📄 **Browse podcast episodes**
- ▶️ **Custom audio player**
  - Play / Pause
  - Seek progress bar
  - Skip forward & backward
- 🕒 **Playback persistence**
  - Resume where you left off after reload
- ⭐ **Favourites**
  - Save and remove favourite podcasts
- 🧾 **Search history**
  - Stored locally and selectable from dropdown
- 📜 **Queue system**
  - Add episodes to a listening queue
  - Remove episodes from queue
- 🖼 **Lazy-loaded images** for performance
- 📱 **Responsive layout**
  - Mobile-friendly tab switching (Search / Listen)
- 📴 **Offline support**
  - Service Worker registration included (PWA-ready)

## 🛠 Tech Stack

- **HTML5**
- **CSS3**
  - CSS variables
  - Container queries
  - Responsive design
- **JavaScript (Vanilla)**
- **Font Awesome** (icons)
- **Google Fonts**
- **LocalStorage API**
- **Intersection Observer API**
- **Service Workers**

## 📁 Project Structure

/
├── index.html # Main HTML structure
├── style.css # Styling and responsive layout
├── script.js # Application logic
├── manifest.json # PWA configuration
├── service-worker.js # Offline support
└── assets/
└── microphone.png

