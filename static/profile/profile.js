import {
  connectDB,
  ref,
  get,
  child,
  remove,
} from "../firebaseConnection/firebaseDBconn.js";

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
//------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  var profileTable = document.getElementById("profileTable");
  var profileIcon = document.getElementById("profileIcon");
  document.getElementById("Loading").innerHTML = "Fetching Data....";

  // Function to create a table row with user data
  function createTableRow(table, key, value) {
    const row = table.insertRow();
    const attributeCell = row.insertCell(0);
    const valueCell = row.insertCell(1);

    attributeCell.textContent = key;
    valueCell.textContent =
      key === "password" ? `*****${value.slice(4)}` : value;
  }

  // Function to populate the profile table
  function populateProfileTable(userData) {
    const loadingElement = document.getElementById("Loading");
    loadingElement.innerHTML = "";

    for (let key in userData) {
      if (userData.hasOwnProperty(key)) {
        if (
          key !== "uid" &&
          key !== "UserLoggedIn" &&
          key !== "emailVerified" &&
          key !== "signupTime" &&
          key !== "lastLoginTime" &&
          key !== "wishlist"
        ) {
          createTableRow(profileTable, key, userData[key]);
        }

        if (key === "wishlist") {
          populateWishlist(userData[key]);
          document.getElementById("wishlistDiv").classList.remove("none");
        } else {
          document.getElementById("wishlist-list").innerHTML = "";
        }
      }
    }
  }

  // Function to populate the wishlist
  function populateWishlist(wishlist) {
    const wishlistContainer = document.getElementById("wishlist-list");
    wishlistContainer.innerHTML = ""; // Clear any existing items

    for (let item in wishlist) {
      if (wishlist.hasOwnProperty(item)) {
        const wishlistItem = document.createElement("div");
        wishlistItem.classList.add("wishlist-item");
        wishlistItem.innerHTML = `
        <img src="${wishlist[item].imageURL}" alt="${wishlist[item].animeName}">
        <h3 style="color:#b33838">${wishlist[item].animeName}</h3>
        <div style=" color: rgb(95, 102, 84);font-style: italic;line-height: 0.2;">
       
        <h4>Populrity :${wishlist[item].popularity}</h4>
        <h4>Year :${wishlist[item].year}</h4>
        <h4>Episodes : ${wishlist[item].episodes}</h4></div>
        <div class="Remove-wishlist">
        <button class="Remove-wishlist-btn" id="wishlist">
        <i class="fa fa-trash" aria-hidden="true"></i>  Remove From wishlist
        </button></div>
      `;
        // console.log(wishlistItem.children[3].children[0]);
        wishlistItem.children[3].children[0].addEventListener("click", () => {
          if (confirm(`Are You sure To Remove "${wishlist[item].animeName}"`)) {
            return RemoveFromWishList(wishlist[item].animeID, wishlistItem);
          }
        });
        wishlistContainer.appendChild(wishlistItem);
      }
    }
  }

  // Fetch user data from Firebase
  const uid = sessionStorage.getItem("userid<@#(1029384756)#@>");
  //remove from wishlist
  function RemoveFromWishList(animeID, wishlistItem) {
    console.log(wishlistItem);
    remove(ref(connectDB, `users/${uid}/wishlist/${animeID}`))
      .then(() => {
        NotifyUser("success", "Removed successfully....", 3000);
        wishlistItem.classList.add("trash-animate");
        setTimeout(() => {
          wishlistItem.classList.add("none");
        }, 1000);
      })
      .catch((error) => {
        NotifyUser("error", "Something Went Wrong.. Please try Agin! ", 3000);

        console.error(error);
      });
  }

  if (uid) {
    get(child(ref(connectDB), "users/" + uid))
      .then((snapshot) => {
        let userData = snapshot.val();
        console.log(userData);
        populateProfileTable(userData);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  } else {
    location.replace("error.html");
    console.error("User ID not found in session storage.");
  }
});
