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
├── index.html # Main HTML structure
├── style.css # Styling and responsive layout
├── script.js # Application logic
├── manifest.json # PWA configuration
├── service-worker.js # Offline support
└── assets/
└── microphone.png

## Some Thoughts
This is my first attempt for a complete web app.
On the way finishing this project , ideas kept popping up while I was trying to implement other stuff in the meantime.

**First and foremost**, ##How could I possibly hide my api key from Users? 
--The answer was quite an interesting one , as it lead me to  more of a Backend concept (middleware).
Basically,I had to create a "mini server" sort of a mediator between the app and the API.(Express.JS)
With the help of Postman (backend tool),I created a server that accepts my custom requests and translates them in acceptable requests for the PODCASTINDEX API.
For that to work I used some packages like envdot which allows my custom mini server to fetch all the data(PODCASTINDEXAPI KEY) from a "secret" env file.
Had to also used CryptoJS to create the hash for the headers needed for the API request.
Plus nodeFetch so I can work with a familiar API(fetch API) from the Web Browser Enviroment to Runtime Enviroment (Node.js) for the sake of brevity.

##Major Problem
After finishing the app,I realised,searches that had many results made the instant scrolling feel laggy and slow while the Web Browser tried to load all the Banners of Podcasts displayed as soon as possible.
**Solution** Lazy Loading.Only the banners of Podcasts diplayed or soon to be displayed,load.
The modern approach consists of setting an observer on all images(Intersection Observer API),leaving all the src attributes blank and loading them through Intersection Observer API only a little before displaying on screen.(basically data-src turnt into src technique).

##Minor Improvement
Faster loading times were achieved through a Web Service Worker that caches all the static files and allows partial functionality even offline.


