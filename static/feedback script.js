import {
  ref,
  get,
  connectDB,
  set,
} from "./firebaseConnection/firebaseDBconn.js";
import { NotifyUser } from "./functions/functions.js";
const but = document.getElementById("submit");

function SendFeedback(Desid, name, email, desc) {
  set(ref(connectDB, "loggers/" + Desid), {
    name: name,
    email: email,
    description: desc,
    TimeStamp: Date(),
  })
    .then(() => {
      but.innerHTML = "submit";
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("des").value = "";
      console.log("User feedback saved successfully.");
      NotifyUser("success", "Submitted successfully....", 3000);
    })
    .catch((e) => {
      but.innerHTML = "submit";

      console.error("Error saving feedback", e);
      NotifyUser("error", "Error saving feedback ", 3000);
    });
}
but.addEventListener("click", (event) => {
  but.innerHTML = "submitting...";
  event.preventDefault();
  const Desid = `${generateUserId()}`;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const desc = document.getElementById("des").value;
  if (name === "" || email === "" || desc === "") {
    but.innerHTML = "submit";

    NotifyUser("error", "Please fill all the fields.. ", 3000);
  } else {
    SendFeedback(Desid, name, email, desc);

    console.log("submitted...!");
  }
});
function generateUserId() {
  return Math.floor(167000 + Math.random() * 9700).toString();
}
// Example usage
