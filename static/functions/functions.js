import { connectDB, set, ref } from "../firebaseConnection/firebaseDBconn.js";

//-----------------ADD wishlist----------------------------------------
const AddtowishList = (animeData, elem, uid) => {
  // console.log(animeData);
  const buttonElem = elem.children[0];

  set(ref(connectDB, `users/${uid}/wishlist/${animeData.animeID}`), {
    animeID: animeData.animeID,
    animeName: animeData.title,
    imageURL: animeData.imageUrl,
    episodes: animeData.episodes,
    year: animeData.year,
    popularity: animeData.popularity,
    TimeStamp: Date(),
  })
    .then(() => {
      // console.log(elem.children[0]);
      buttonElem.innerHTML = `<i class="fa fa-check" style="font-size:21px" ></i> Added`;
      buttonElem.setAttribute("disabled", "true");
      buttonElem.style.cursor = "not-allowed";
      NotifyUser("success", "Added successfully....", 3000);
    })
    .catch((e) => {
      console.error("Error ", e);
      NotifyUser("error", "Something Went Wrong.. Please try Again! ", 3000);
    });
};
//-------------------------------------------------

// Notify function to show success or error messages
var notifyTimeout;

function NotifyUser(ErrorType, message, duration) {
  var errorMessage = document.getElementById("NotifyUser");

  // Clear any existing timeout
  clearTimeout(notifyTimeout);

  errorMessage.innerHTML = "";

  // Set message type and content
  if (ErrorType === "success") {
    errorMessage.classList.add("successMessage");
    errorMessage.innerHTML = `<i class="fa fa-check" style="font-size:20px" aria-hidden="true"></i> ${message}`;
  } else {
    errorMessage.classList.add("errorMessage");
    errorMessage.innerHTML = `<i class="fa fa-exclamation-circle" style="font-size:20px" aria-hidden="true"></i> ${message}`;
  }

  // Show the message and hide it after the duration
  errorMessage.classList.remove("none");
  notifyTimeout = setTimeout(() => {
    errorMessage.classList.add("none");
    errorMessage.classList.remove("errorMessage", "successMessage");
    errorMessage.innerHTML = "";
  }, duration);
}

export { NotifyUser, AddtowishList };
