const vw = window.innerWidth;
const containersGrid = document.querySelector(".features-grid");
const navButtons = document.querySelectorAll(".nav button");
const updateTabThrottler = updateThrottler(updateTab, 1000);
const historyBar = document.querySelector(".custom-search-history");
const searchInput = document.getElementById("search-item");
const dropdown = document.querySelector(".dropdown");
const formElement = document.getElementById("toolbar-search");
const clearBtn = document.querySelector(".btn-clear");
const resultContainer = document.querySelector(".result-container");
const errorMessage = document.querySelector(".error");
const options = {
  root: resultContainer,
  rootMargin: "0px",
  threshold: 0,
  scrollMargin: "0px 0px 5000px 0px",
};
const imagesObserver = new IntersectionObserver((entries, imagesObserver) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    preloadImg(entry.target);
    imagesObserver.unobserve(entry.target);
  });
}, options);
const audio = document.getElementById("audio-player");
const audioContainer = document.getElementById("audio-container");
const convertSeconds = (seconds) => {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  hours = Math.floor(seconds / 3600) > 0 ? hours.toString() : "";
  minutes = Math.floor((seconds % 3600) / 60) > 0 ? minutes.toString() : "";

  return `${hours.padStart(2, "0")}:${minutes.padStart(
    2,
    "0"
  )}:${remainingSeconds.toString().padStart(2, "0")}`;
};
const progressAudio = document.querySelector(".audio-progress");

let queueList = JSON.parse(localStorage.getItem("queueList")) ?? {};
let currentIndex = 0;
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) ?? [];
let favouritesHistory = JSON.parse(localStorage.getItem("favHistory")) ?? [];
const podcastPlaying = JSON.parse(localStorage.getItem("currentPodcast")) ?? {
  img: "microphone.png",
  title: "Podcast's Title",
  date: "--/--/----",
  duration: 0,
  currentTime: 0,
};

audio.addEventListener("canplay", () => {
  progressAudio.querySelector("div").classList.remove("loading-bar");
});
audioContainer.addEventListener("click", audioControls);

audioContainer
  .querySelector(".audio-progress")
  .addEventListener("click", (e) => {
    const progressDetails = progressAudio.getBoundingClientRect();
    podcastPlaying.currentTime =
      ((e.clientX - progressDetails.left) / progressDetails.width) *
      podcastPlaying.duration;
    const progressBarWidth = Math.floor(
      (podcastPlaying.currentTime / podcastPlaying.duration) * 100
    );
    audioContainer.querySelector(
      ".audio-progress > div"
    ).style.width = `${progressBarWidth}%`;
    audioContainer.querySelector(".current").textContent = convertSeconds(
      podcastPlaying.currentTime
    );
    localStorage.setItem("currentPodcast", JSON.stringify(podcastPlaying));
  });
clearBtn.addEventListener("click", () => {
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
  searchHistory = [];
  localStorage.removeItem("searchHistory");
});
formElement.addEventListener("submit", submitHandler);
historyBar.addEventListener("click", () => {
  this.focus({ focusVisible: true });
  adjustDropdown();
  displayDropdown();
});

historyBar.addEventListener("blur", () => {
  if (dropdown.matches(".close")) return;
  displayDropdown();
});
window.addEventListener("load", loadLastPodcast);
window.addEventListener("resize", updateTabThrottler);
window.addEventListener("load", updateTab);
navButtons.forEach((btn) => btn.addEventListener("click", selectTab));
window.addEventListener("load", initSearchHistory);
window.addEventListener("load", initFavourites);
window.addEventListener("load", initQueue);

function initQueue() {
  if (isEmpty(queueList)) return;
  const queue = Object.values(queueList);
  queue.forEach(createQueueList);
}

function preloadImg(img) {
  const src = img.getAttribute("data-src");
  if (!src) {
    return;
  }
  img.src = src;
}

function initFavourites() {
  if (favouritesHistory.length === 0) {
    resultContainer.dataset.loading = "error";
    return;
  }
  const loadFavourites = [];
  for (id of favouritesHistory) {
    loadFavourites.push(getIDResult(id));
  }
  Promise.all(loadFavourites).then(createShowsList);
}

async function getSearchResults(searchVal) {
  const trimmedSearchVal = searchVal.trim();
  resultContainer.dataset.loading = "true";
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(searchVal)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`${res.status} ${data.error}`);
    }
    if (res.ok) {
      if (data.count !== 0) {
        resultContainer.dataset.loading = "false";
        deletePrevShowsList();
        createShowsList(data.feeds);
      } else {
        resultContainer.dataset.loading = "error";
        errorMessage.textContent = data.description;
      }
    }
  } catch (e) {
    resultContainer.dataset.loading = "error";
    errorMessage.textContent = e.message;
  } finally {
    setTimeout(
      () =>
        (errorMessage.textContent = "Please retry entering a podcast title."),
      5000
    );
  }
}

async function getIDResult(searchVal) {
  resultContainer.dataset.loading = "true";
  try {
    const res = await fetch(
      `/api/searchID?id=${encodeURIComponent(searchVal)}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`${res.status} ${data.error}`);
    }
    if (res.ok) {
      return data.feed;
    }
  } catch (e) {
    resultContainer.dataset.loading = "error";
    errorMessage.textContent = e.message;
  } finally {
    resultContainer.dataset.loading = "favourites";
  }
}

async function getEpisodes(podcastID) {
  resultContainer.dataset.loading = "true";
  try {
    const res = await fetch(
      `/api/search/episodes?id=${encodeURIComponent(podcastID)}&max=1000`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`${res.status} ${data.error}`);
    }
    if (res.ok) {
      return data.items;
    }
  } catch (e) {
    resultContainer.dataset.loading = "error";
    errorMessage.textContent = e.message;
  } finally {
    resultContainer.dataset.loading = "false";
  }
}

function deletePrevShowsList() {
  const prevList = document.querySelector(".cardlist-grid");
  if (prevList === null) return;
  prevList.remove();
}

function toggleFavourites(e) {
  if (!e.target.classList.contains("fa-star")) {
    return;
  }
  const clickedCard = e.target.closest(".card-container");
  if (!favouritesHistory.includes(parseInt(clickedCard.dataset.id))) {
    favouritesHistory.push(parseInt(clickedCard.dataset.id));
    localStorage.setItem("favHistory", JSON.stringify(favouritesHistory));
    e.target.classList.replace("fa-regular", "fa-solid");
  } else {
    const id = parseInt(clickedCard.dataset.id);
    const idIndex = favouritesHistory.indexOf(id);
    favouritesHistory.splice(idIndex, 1);
    localStorage.setItem("favHistory", JSON.stringify(favouritesHistory));
    e.target.classList.replace("fa-solid", "fa-regular");
  }
}

//innerHTML used for testing purposes at the moment,will be swapped with createElement, appendChild etc when everything functional

function createShowsList(data) {
  const div = document.createElement("div");
  div.className = "cardlist-grid";
  resultContainer.appendChild(div);
  resultContainer.scroll(div.firstElementChild);
  const showListContent = data.map((item) => {
    const publishedDate =
      item.newestItemPubdate === undefined
        ? item.lastUpdateTime
        : item.newestItemPubdate;
    const date = new Date(publishedDate * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const favouriteCheck = favouritesHistory.includes(item.id)
      ? "solid"
      : "regular";
    return `<div class="card-container" data-id=${item.id}>
      <div class="card">
       <div class="card--image">
         <img data-src="${item.image}" alt="shows artwork" />
        </div>
        <div class="card--description show">
          <h2>${item.title}</h2>
          <p class="show--description">${item.description}</p>
          <p class="show--episodes">Episodes: <span>${item.episodeCount}</span></p>
          <p class="show--last">Newest Episode:<time datetime="${year}-${month}-${day}">${day}/${month}/${year}</time></p>
          <i class="fa-${favouriteCheck} fa-star"></i>
        </div>
      </div>
    </div>`;
  });
  div.innerHTML = showListContent.join("");
  div
    .querySelectorAll("[data-src]")
    .forEach((img) => imagesObserver.observe(img));
  resultContainer.scroll(div.firstElementChild);
  div.addEventListener("click", (e) => {
    toggleFavourites(e);
    if (
      resultContainer.dataset.loading === "favourites" &&
      e.target.classList.contains("fa-star")
    ) {
      deletePrevShowsList();
      initFavourites();
    }
    if (!e.target.classList.contains("fa-star")) {
      const cardClicked = e.target.closest(".card-container");
      deletePrevShowsList();
      getEpisodes(parseInt(cardClicked.dataset.id)).then(createEpisodesList);
    }
  });
}
let dublicateCheck = [];
function createEpisodesList(data) {
  const div = document.createElement("div");
  div.className = "cardlist-grid";
  resultContainer.appendChild(div);
  const episodesListContent = data.map((item) => {
    const publishedDate = item.datePublished;
    const date = new Date(publishedDate * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const image = item.image ? item.image : item.feedImage;
    return `<div class="card-container" data-id=${item.id}>
      <div class="card">
       <div class="card--image">
         <img data-src="${image}" alt="artwork of episode" />
        </div>
        <div class="card--description episode">
          <h2>${item.title}</h2>
          <i class="fa-solid fa-play" data-src="${item.enclosureUrl}" data-img="${image}" data-title="${item.title}" data-date="${day}/${month}/${year}"></i>
          <i class="fa-solid fa-list"></i>
          <span>Published: <time datetime="${year}-${month}-${day}">${day}/${month}/${year}</time></span> 
          <p class="show--description">${item.description}</p>
          <i class="fa-regular fa-star"></i>
        </div>
      </div>
    </div>`;
  });
  div.innerHTML = episodesListContent.join("");
  div
    .querySelectorAll("[data-src]")
    .forEach((img) => imagesObserver.observe(img));
  resultContainer.scroll(div.firstElementChild);
  div.addEventListener("click", (e) => {
    if (e.target.classList.contains("fa-play")) {
      if (e.target.dataset.src === audio.src) {
        if (audio.paused) {
          playAudio(e);
        }
        audio.currentTime = 0;
        return;
      }
      swapPlayerDetails(e);
      playAudio(e);
    } else if (e.target.classList.contains("fa-list")) {
      const cardClicked = e.target.closest(".card-container");
      if (dublicateCheck.includes(cardClicked.dataset.id)) return;
      dublicateCheck.push(cardClicked.dataset.id);
      queueList[cardClicked.dataset.id] = {
        image: cardClicked.children[0].children[0].firstElementChild.src,
        title:
          cardClicked.children[0].children[1].firstElementChild.textContent.slice(
            0,
            20
          ) + " ...",
        audioSrc:
          cardClicked.children[0].children[1].querySelector(".fa-play").dataset
            .src,
        date: cardClicked.children[0].children[1].querySelector(".fa-play")
          .dataset.date,
        id: cardClicked.dataset.id,
      };
      localStorage.setItem("queueList", JSON.stringify(queueList));

      createQueueList(queueList[cardClicked.dataset.id]);
    }
  });
}

function createQueueList(item) {
  let innerHTMLList = "";
  const queueContainer = document.querySelector(".queue-container");
  innerHTMLList = `
    <div class="queue-card">
                <img src="${item.image}" alt="episodes artwork" />
                <p>${item.title}</p>
                <div class="queue-controls">
                  <i class="fa-solid fa-play" data-src="${item.audioSrc}" data-img="${item.image}" data-title="${item.title}" data-date="${item.date}" ></i>
                  <i class="fa-solid fa-delete-left" data-id="${item.id}"></i>
                </div>
              </div>
    `;
  queueContainer.innerHTML += innerHTMLList;
  queueContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("fa-play")) {
      if (e.target.dataset.src === audio.src) {
        if (audio.paused) {
          playAudio(e);
        }
        audio.currentTime = 0;
        return;
      }
      swapPlayerDetails(e);
      playAudio(e);
    } else if (e.target.classList.contains("fa-delete-left")) {
      delete queueList[e.target.dataset.id];
      localStorage.setItem("queueList", JSON.stringify(queueList));
      if (isEmpty(queueList)) {
        queueContainer.innerHTML = "";
      } else {
        queueContainer.innerHTML = "";
        Object.values(queueList).forEach(createQueueList);
      }
    }
  });
}

function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

function loadLastPodcast() {
  audioContainer.querySelector("img").src = podcastPlaying.img;
  audioContainer.querySelector(".audio-title").textContent =
    podcastPlaying.title;
  audioContainer.querySelector("[datetime]").textContent = podcastPlaying.date;
  audioContainer.querySelector(".duration").textContent = convertSeconds(
    podcastPlaying.duration
  );
  audioContainer.querySelector(".current").textContent = convertSeconds(
    podcastPlaying.currentTime
  );
  const progressBarWidth = Math.floor(
    (podcastPlaying.currentTime / podcastPlaying.duration) * 100
  );
  audioContainer.querySelector(
    ".audio-progress > div"
  ).style.width = `${progressBarWidth}%`;
  audio.src = podcastPlaying.src;
  audio.load();
}

function swapPlayerDetails(e) {
  if (!e.target.classList.contains("fa-play")) return;
  podcastPlaying.src = e.target.dataset.src;
  podcastPlaying.img = e.target.dataset.img;
  podcastPlaying.title = e.target.dataset.title;
  podcastPlaying.date = e.target.dataset.date;
  audioContainer.querySelector("img").src = podcastPlaying.img;
  audioContainer.querySelector(".audio-title").textContent =
    podcastPlaying.title;
  audioContainer.querySelector("[datetime]").textContent = podcastPlaying.date;
  localStorage.setItem("currentPodcast", JSON.stringify(podcastPlaying));
}

function enableAudioMetaData(e) {
  podcastPlaying.duration = audio.duration;
  audioContainer.querySelector(".duration").textContent = convertSeconds(
    audio.duration
  );

  audio.addEventListener("timeupdate", () => {
    audioContainer.querySelector(".current").textContent = convertSeconds(
      audio.currentTime
    );
    const progressBarWidth = Math.floor(
      (audio.currentTime / audio.duration) * 100
    );
    audioContainer.querySelector(
      ".audio-progress > div"
    ).style.width = `${progressBarWidth}%`;
    audioContainer
      .querySelector(".audio-progress")
      .addEventListener("click", (e) => {
        const progressDetails = progressAudio.getBoundingClientRect();
        audio.currentTime =
          ((e.clientX - progressDetails.left) / progressDetails.width) *
          audio.duration;
      });
    podcastPlaying.currentTime = audio.currentTime;
    localStorage.setItem("currentPodcast", JSON.stringify(podcastPlaying));
  });
}
function audioControls(e) {
  if (e.target.classList.contains("fa-play")) {
    audio.play().then(() => {
      audio.currentTime = podcastPlaying.currentTime;
      enableAudioMetaData();
      e.target.classList.replace("fa-play", "fa-pause");
    });
  } else if (e.target.classList.contains("fa-pause")) {
    audio.pause();
    e.target.classList.replace("fa-pause", "fa-play");
  } else if (e.target.classList.contains("fa-forward")) {
    audio.currentTime += 15;
    enableAudioMetaData();
  } else if (e.target.classList.contains("fa-backward")) {
    audio.currentTime -= 15;
    enableAudioMetaData();
  }
}

function playAudio(e) {
  if (!e.target.classList.contains("fa-play")) return;
  audio.src = podcastPlaying.src;

  audio.play().then(() => {
    enableAudioMetaData();
    document
      .getElementById("audio-controls")
      .querySelector(".fa-play")
      ?.classList.replace("fa-play", "fa-pause");
  });

  progressAudio.querySelector("div").classList.add("loading-bar");
}

function submitHandler(e) {
  e.preventDefault();
  if (!searchInput.value.trim()) {
    searchInput.value = "";
    return;
  }
  getSearchResults(searchInput.value);
  updateSearchHistory(searchInput.value);
  searchInput.value = "";
}

function initSearchHistory() {
  if (searchHistory.length === 0) return;
  for (item of searchHistory) {
    updateDropdown(item);
  }
}

function updateSearchHistory(prevSearch) {
  if (searchHistory.includes(prevSearch)) return;
  searchHistory.push(prevSearch);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  updateDropdown(prevSearch);
}

function updateDropdown(option) {
  const p = document.createElement("p");
  p.textContent = option;
  dropdown.appendChild(p);
  p.addEventListener("click", () => getSearchResults(option));
}

function adjustDropdown() {
  const historyBarHeight = window.getComputedStyle(historyBar).height;
  dropdown.style.top = historyBarHeight;
}

function displayDropdown() {
  dropdown.classList.toggle("close");
}

function selectTab(e) {
  const btnClicked = e.target;

  if (btnClicked.matches(".active")) return;
  navButtons[(currentIndex + 1) % 2].classList.toggle("active");
  navButtons[currentIndex].classList.toggle("active");
  updateTab();
}

function updateTab() {
  const vw = window.innerWidth;
  const navButtonsArr = Array.from(navButtons);
  const activeTab = navButtonsArr.filter((btn) => btn.matches(".active"))[0];
  if (vw < 1001 && activeTab === navButtons[0]) {
    containersGrid.dataset.mobileState = "search";
  } else if (vw < 1001 && activeTab === navButtons[1]) {
    containersGrid.dataset.mobileState = "listen";
  } else {
    containersGrid.dataset.mobileState = "off";
  }
}

function updateThrottler(f, ms) {
  let isThrottled = false;
  let thisArg;
  let argsArg;
  return function wrapper(...argus) {
    if (isThrottled) {
      thisArg = this;
      argsArg = argus;
      return;
    }
    isThrottled = true;
    f.apply(thisArg, argsArg);
    setTimeout(() => {
      isThrottled = false;
      wrapper.apply(thisArg, argsArg);
      thisArg = null;
      argsArg = null;
    }, ms);
  };
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
