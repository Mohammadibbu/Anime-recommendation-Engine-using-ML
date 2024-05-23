const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
const loginForm_div = document.querySelector("#loginForm");

const close_icon = document.querySelector(".close");
close_icon.style.cursor = "pointer";
close_icon.onclick = () => {
  overlay1.classList.remove("fade-in");
  loginForm_div.classList.add("none");

  overlay1.classList.add("fade-out");
};

overlay1.onclick = () => {
  overlay1.classList.remove("fade-in");
  loginForm_div.classList.add("none");
  anime_details.classList.add("none");

  overlay1.classList.add("fade-out");
};

document.querySelector("#reg").onclick = () => {
  overlay1.classList.add("fade-in");
  loginForm_div.classList.remove("none");
  anime_details.classList.add("none");
  overlay1.classList.remove("fade-out");
};
document.querySelector("#reg_footer").onclick = () => {
  overlay1.classList.add("fade-in");
  loginForm_div.classList.remove("none");
  anime_details.classList.add("none");
  overlay1.classList.remove("fade-out");
};

signupBtn.onclick = () => {
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
};
loginBtn.onclick = () => {
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
};
signupLink.onclick = () => {
  signupBtn.click();
  return false;
};
