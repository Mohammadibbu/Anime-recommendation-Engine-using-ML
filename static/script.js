const menu = document.querySelector(".header .menu");
const navgation = document.querySelector(".header .main-navgation");
const links = document.querySelectorAll(".header .main-navgation a");
const overlay = document.querySelector(".overlay");
const overlay1 = document.querySelector(".overlay1");

function openMobileNavgation() {
  menu.classList.add("open");
  navgation.classList.add("fade-in");
  controlOverlay("open");
}

function closeMobileNavgation() {
  menu.classList.remove("open");
  navgation.classList.remove("fade-in");
  controlOverlay("close");
}

menu.addEventListener("click", () => {
  menu.classList.toggle("open");
  navgation.classList.toggle("fade-in");
  controlOverlay(menu.classList.contains("open") ? "open" : "close");
});

links.forEach((link) => {
  link.addEventListener("click", closeMobileNavgation);
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024 && menu.classList.contains("open")) {
    closeMobileNavgation();
  }
});

function controlOverlay(status) {
  overlay.classList.toggle("fade-in", status === "open");
  overlay.classList.toggle("fade-out", status !== "open");
}

const submit = document.getElementById("submit");
const search_input = document.getElementById("title");
const anime_details = document.getElementById("anime-details");

function show_anime_details(anime) {
  overlay1.classList.add("fade-in");
  anime_details.classList.remove("none");
  overlay1.classList.remove("fade-out");
  anime_details.innerHTML = `
    <div style="display: flex; justify-content: end" class="close1">
      <i class="fa fa-close" style="font-size: 30px; color: rgb(95, 91, 91)"></i>
    </div>
    <div class="anime-details-div">
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
  const close_icon1 = document.querySelector(".close1");
  close_icon1.onclick = () => {
    overlay1.classList.remove("fade-in");

    anime_details.classList.add("none");
    overlay1.classList.add("fade-out");
  };
}
//fething from API  [jikan]
function imgFetch(anime) {
  return fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
      anime.title
    )}&limit=1`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "429") {
        return imgFetch(anime);
      } else {
        return {
          title: data.data[0].title,
          description: data.data[0].synopsis,
          year: data.data[0].aired.prop.from.year,
          episodes: data.data[0].episodes,
          popularity: data.data[0].popularity,
          members: data.data[0].members,
          imageUrl: data.data[0].images.jpg.image_url,
        };
      }
    })
    .catch((error) => {
      console.error("Error while fetching data:", error);
      throw error;
    });
}

// SubmitEvent
submit.addEventListener("click", () => {
  if (!search_input.value) {
    alert("Please enter an Anime Name...");
  } else {
    document.getElementById("spinner").classList.add("fa-spinner", "fa-spin");
  }
});
// form submit
document
  .getElementById("recommendationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    if (!search_input.value) {
      alert("Please enter an Anime Name...");
      return;
    }
    //add spinnner
    document.getElementById("spinner").classList.add("fa-spinner", "fa-spin");
    // fetch data from app.py
    fetch("/recommend", { method: "POST", body: new FormData(event.target) })
      .then((response) => response.json())
      .then((data) => {
        document
          .getElementById("spinner")
          .classList.remove("fa-spinner", "fa-spin");
        const recommendationsDiv = document.getElementById("recommendations");
        const error = document.getElementById("error");
        error.classList.add("none");
        recommendationsDiv.innerHTML = "";

        if (data.message) {
          error.classList.remove("none");
          error.innerHTML = `<b>${data.message}</b>`;
        } else {
          document.getElementById(
            "error"
          ).innerHTML = `<h3 style="color:green">recommendations For ${search_input.value} </h3>`;
          data.forEach((anime) => {
            const animeItem = document.createElement("div");
            animeItem.classList.add("anime-item");
            animeItem.innerHTML = `
            <img src="/static/media/loadingSkeleton.svg" alt="${anime.title}" class="zoom-effect">
            <h3 style="color: rgb(0,0,0);">${anime.title}</h3>
            <p><h4 style="color: red;">Rating: ${anime.rating}</h4></p>
          `;
            recommendationsDiv.appendChild(animeItem);
            imgFetch(anime)
              .then((animeDetails) => {
                animeItem.querySelector("img").src = animeDetails.imageUrl;
                animeItem.addEventListener("click", () =>
                  show_anime_details(animeDetails)
                );
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
        document.getElementById("error").innerHTML =
          "<b>Failed to get recommendations. Please try again.</b>";
      });
  });
