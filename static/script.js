import { AddtowishList, NotifyUser } from "./functions/functions.js";
// Selecting DOM elements for navigation and overlay
const menu = document.querySelector(".header .menu");
const navigation = document.querySelector(".header .main-navigation");
const links = document.querySelectorAll(".header .main-navigation a");
const overlay = document.querySelector(".overlay");
const overlay1 = document.querySelector(".overlay1");

// Functions to open and close the mobile navigation
function openMobileNavigation() {
  menu.classList.add("open");
  navigation.classList.add("fade-in");
  controlOverlay("open");
}

function closeMobileNavigation() {
  menu.classList.remove("open");
  navigation.classList.remove("fade-in");
  controlOverlay("close");
}

// Event listener for menu click to toggle navigation
menu.addEventListener("click", () => {
  overlay1.classList.remove("fade-in");
  document.querySelector("#loginForm").classList.add("none");
  overlay1.classList.add("fade-out");
  menu.classList.toggle("open");
  navigation.classList.toggle("fade-in");
  controlOverlay(menu.classList.contains("open") ? "open" : "close");
});

// Close mobile navigation when a link is clicked
links.forEach((link) => {
  link.addEventListener("click", closeMobileNavigation);
});

// Close mobile navigation on window resize if width is >= 1024px
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024 && menu.classList.contains("open")) {
    closeMobileNavigation();
  }
});

// Function to control the overlay visibility
function controlOverlay(status) {
  overlay.classList.toggle("fade-in", status === "open");
  overlay.classList.toggle("fade-out", status !== "open");
}

// Selecting form elements and anime details container
const submit = document.getElementById("submit");
const searchInput = document.getElementById("title");
const animeDetails = document.getElementById("anime-details");

// Function to display anime details in a modal
function showAnimeDetails(anime) {
  overlay1.classList.add("fade-in");
  animeDetails.classList.remove("none");
  // Add show class for animation
  setTimeout(() => {
    animeDetails.classList.add("show");
  }, 10);
  overlay1.classList.remove("fade-out");
  animeDetails.innerHTML = `
    <div style="display: flex; justify-content: end" class="close1">
      <i class="fa fa-close" style="font-size: 30px; color: rgb(95, 91, 91)"></i>
    </div>
    <div class="anime-details-div" id="animeDiv">
      <div class="img">
        <img src="${anime.imageUrl}" alt="${anime.title}" />
      </div>
      <div class="anime-details-list">
        <h3 class="anime-title">${anime.title}</h3>
        <h4>Anime synopsis</h4>
        <i>${anime.description}</i>
        <div style="display: flex; flex-direction: column; color: rgb(38, 139, 139); font-weight: 300;">
          <span>Year: ${anime.year}</span>
          <span>Members: ${anime.members}</span>
          <span>Episodes: ${anime.episodes}</span>
          <span>Popularity: ${anime.popularity}</span>
        </div>
      </div>
    </div>
  `;
  document.documentElement.scrollTop = 2;

  // Close icon event listener
  const closeIcon1 = document.querySelector(".close1");
  closeIcon1.style.cursor = "pointer";
  closeIcon1.onclick = () => {
    animeDetails.classList.remove("show");
    overlay1.classList.remove("fade-in");
    overlay1.classList.add("fade-out");
    setTimeout(() => {
      animeDetails.classList.add("none");
    }, 300);
  };
}

// Fetch anime data from the Jikan API
function fetchAnimeDetails(anime) {
  return fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
      anime.title
    )}&limit=1`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "429") {
        return fetchAnimeDetails(anime); // Retry if rate limited
      } else {
        const animeData = data.data[0];
        // console.log(animeData);
        return {
          animeID: animeData.mal_id,
          title: animeData.title,
          description: animeData.synopsis,
          year: animeData.aired.prop.from.year,
          episodes: animeData.episodes,
          popularity: animeData.popularity,
          members: animeData.members,
          imageUrl: animeData.images.jpg.image_url,
        };
      }
    })
    .catch((error) => {
      console.error("Error while fetching data:", error);
      throw error;
    });
}

// Submit button click event to show spinner and validate input
submit.addEventListener("click", () => {
  if (!searchInput.value) {
    NotifyUser("error", "Please enter an Anime Name...", 3500);
  } else {
    document.getElementById("spinner").classList.add("fa-spinner", "fa-spin");
  }
});

// Form submit event to fetch and display recommendations
document
  .getElementById("recommendationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    if (!searchInput.value) {
      NotifyUser("error", "Please enter an Anime Name...", 3500);
      return;
    }

    // Show spinner
    document.getElementById("spinner").classList.add("fa-spinner", "fa-spin");

    // Fetch recommendations from the server
    fetch("/recommend", { method: "POST", body: new FormData(event.target) })
      .then((response) => response.json())
      .then((data) => {
        document
          .getElementById("spinner")
          .classList.remove("fa-spinner", "fa-spin");
        const recommendationsDiv = document.getElementById("recommendations");
        recommendationsDiv.innerHTML = "";

        if (data.message) {
          NotifyUser("error", `${data.message}`, 3500);
        } else {
          NotifyUser(
            "success",
            `Recommendations For ${searchInput.value}`,
            3500
          );
          data.forEach((anime) => {
            const animeItem = document.createElement("div");
            animeItem.classList.add("anime-item");
            // Add stagger animation delay
            const index = Array.from(recommendationsDiv.children).length;
            animeItem.style.animationDelay = `${index * 0.1}s`;
            animeItem.innerHTML = `
            <div>
            <img src="/static/media/loadingSkeleton.svg" alt="${anime.title}" class="zoom-effect">
            <h3 style="color: rgb(0,0,0);">${anime.title}</h3>
            <h4 style="color: red;">Rating: ${anime.rating}</h4>
           
             </div>
              <div class="wish-list">
              <button class="wishlist-btn" id="wishlist">
               + Add to wishlist
              </button></div>
          `;

            recommendationsDiv.appendChild(animeItem);
            // console.log(animeItem.children[1].children[0]);
            // Fetch anime details and update the anime item
            fetchAnimeDetails(anime)
              .then((animeDetails) => {
                animeItem.querySelector("img").src = animeDetails.imageUrl;
                animeItem.children[0].addEventListener("click", () =>
                  showAnimeDetails(animeDetails)
                );
                animeItem.children[1].addEventListener("click", () => {
                  if (!sessionStorage.getItem("userid<@#(1029384756)#@>")) {
                    NotifyUser(
                      "error",
                      "You must be logged in to add to a wishlist",
                      3000
                    );
                    document.documentElement.scrollTop = 2;

                    document
                      .querySelector(".overlay1")
                      .classList.add("fade-in");
                    document
                      .querySelector(".overlay1")
                      .classList.remove("fade-out");
                    document
                      .querySelector("#loginForm")
                      .classList.remove("none");
                  } else {
                    AddtowishList(
                      animeDetails,
                      animeItem.children[1],
                      sessionStorage.getItem("userid<@#(1029384756)#@>")
                    );
                  }
                });
              })
              .catch((error) => console.error("Failed to fetch data:", error));
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
        document
          .getElementById("spinner")
          .classList.remove("fa-spinner", "fa-spin");
        NotifyUser(
          "error",
          "Failed to get recommendations. Please try again.",
          5000
        );
      });
  });

// Add scroll effect to header
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Add intersection observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.anime-item, h2, .hero-text');
  animatedElements.forEach(el => {
    observer.observe(el);
  });
});