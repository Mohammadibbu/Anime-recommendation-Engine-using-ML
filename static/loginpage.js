import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  connectDB,
  ref,
  get,
  set,
  child,
  update,
  signOut,
} from "./firebaseConnection/firebaseDBconn.js";
import { NotifyUser } from "./functions/functions.js";
//get user id from session storage
const userAuthUid = sessionStorage.getItem("userid<@#(1029384756)#@>");
//sign up form
const signupPwd = document.querySelector("#signup_password");
const signupCNFPwd = document.querySelector("#signup_CNFpassword");
const signupEmail = document.querySelector("#signup_email");
const signupUName = document.querySelector("#name");
const signupBtn = document.querySelector("#signup_btn");
//login form

const loginBtn = document.querySelector("#login_btn");
const loginPwd = document.querySelector("#login_password");
const loginEmail = document.querySelector("#login_email");

//Forgot password
const ForgotPassword = (email) => {
  // Reference to the Firebase Realtime Database
  const usersRef = ref(connectDB, "users");

  // Query the database for the provided email
  const query = ref(connectDB, `users`);

  get(query)
    .then((snapshot) => {
      let emailExists = false;
      snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();
        if (childData.email === email.value) {
          emailExists = true;
        }
      });

      if (emailExists) {
        // If email exists, send the password reset email
        sendPasswordResetEmail(auth, email.value)
          .then(() => {
            NotifyUser(
              "success",
              "Password recovery mail sent successfully.",
              3000
            );
            email.value = "";
          })
          .catch((e) => {
            NotifyUser("error", e.message, 3000);
            console.log(e);
            handleAuthError(e);
          });
      } else {
        // If email does not exist, show an error message
        NotifyUser("error", "Email address not found.", 3000);
      }
    })
    .catch((e) => {
      console.error("Error checking email existence", e);
      NotifyUser("error", "Something went wrong. Please try again.", 3000);
    });
};

// Function to save user data to the database
const saveUserData = (uid, name, email, pwd, mailverification, loginValue) => {
  set(ref(connectDB, `users/${uid}`), {
    signupTime: new Date().toString(),
    lastLoginTime: "Not logged in yet",
    uid: uid,
    UserName: name,
    email: email,
    password: pwd,
    emailVerified: mailverification,
    UserLoggedIn: loginValue,
  })
    .then(() => {
      console.log("User data saved successfully.");
    })
    .catch((e) => {
      console.error("Error saving user data", e);
    });
};

// Event listener for the signup button
signupBtn.addEventListener("click", function (event) {
  event.preventDefault();
  signupBtn.value = "Loading...";

  const name = signupUName.value;
  const email = signupEmail.value;
  const password = signupPwd.value;
  const confirmPassword = signupCNFPwd.value;

  // Validate form inputs
  if (password !== confirmPassword) {
    signupBtn.value = "Sign Up";
    NotifyUser("error", "Passwords do not match.", 3500);
  } else if (!name || !email || !password || !confirmPassword) {
    signupBtn.value = "Sign Up";
    NotifyUser("error", "Please fill in all required fields.", 3500);
  } else {
    // Create new user with email and password
    createUserWithEmailAndPassword(auth, email, password)
      .then((userdetails) => {
        signupBtn.value = "Sign Up";
        signupUName.value = "";
        signupEmail.value = "";
        signupPwd.value = "";
        signupCNFPwd.value = "";

        saveUserData(
          userdetails.user.uid,
          name,
          userdetails.user.email,
          password,
          userdetails.user.emailVerified,
          false
        );
        NotifyUser("success", "Signup successful!", 3500);

        // Send email verification
        sendEmailVerification(auth.currentUser)
          .then(() => {
            setTimeout(() => {
              document.querySelector("label.login").click();
              NotifyUser(
                "success",
                "Verification email sent successfully!",
                3500
              );
            }, 3500);
          })
          .catch((e) => {
            console.error("Error sending verification email", e);
          });
      })
      .catch((e) => {
        signupBtn.value = "Sign Up";
        handleAuthError(e);
      });
  }
});

// Event listener for the login button
loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  loginBtn.value = "Loading...";
  const email = loginEmail.value;
  const password = loginPwd.value;

  // Validate form inputs
  if (!email || !password) {
    loginBtn.value = "Login";
    NotifyUser("error", "Please fill in all required fields.", 3500);
  } else {
    // Sign in with email and password
    signInWithEmailAndPassword(auth, email, password)
      .then((userdetails) => {
        loginBtn.value = "Login";
        if (!userdetails.user.emailVerified) {
          alert("Please verify your email to login.");
          if (confirm("Resend verification email?")) {
            sendEmailVerification(auth.currentUser)
              .then(() => {
                alert("Verification email sent successfully!");
              })
              .catch((e) => {
                console.log("Error sending verification email", e);
              });
          }
        } else {
          sessionStorage.setItem(
            "userid<@#(1029384756)#@>",
            userdetails.user.uid
          );
          sessionStorage.setItem("LOgiN#@$%^&;;", true);
          //update user password after reset
          update(ref(connectDB, "users/" + userdetails.user.uid), {
            password: password,
          })
            .then(() => {
              console.log("User password updated.");
            })
            .catch((e) => {
              console.error("Error updating user status", e);
            });
          updateUserStatus(userdetails.user.uid, true);
          getUserData(userdetails.user.uid);
        }
      })
      .catch((e) => {
        loginBtn.value = "Login";
        handleAuthError(e);
      });
  }
});
// Event listener for the reset password button
document.getElementById("Reset_password").addEventListener("click", (e) => {
  e.preventDefault();
  const resetpwdMAIL = document.getElementById("Reset_password_mail");
  ForgotPassword(resetpwdMAIL);
});

// Function to update user status in the database
const updateUserStatus = (uid, status) => {
  update(ref(connectDB, "users/" + uid), {
    lastLoginTime: new Date().toString(),
    emailVerified: true,
    UserLoggedIn: status,
  })
    .then(() => {
      console.log("User status updated.");
    })
    .catch((e) => {
      console.error("Error updating user status", e);
    });
};

// Function to get user data from the database
const getUserData = (uid) => {
  get(child(ref(connectDB), "users/" + uid))
    .then((snapshot) => {
      const data = snapshot.val();
      NotifyUser("success", `Welcome, ${data.UserName}`, 3000);
      updateUIForLoggedInUser(uid, data.UserName);
    })
    .catch((e) => {
      NotifyUser("error", `${e}`, 3500);
      console.error("Error fetching user data", e);
    });
};

// Function to handle authentication errors
const handleAuthError = (e) => {
  let errorMsg = "";
  switch (e.code) {
    case "auth/invalid-email":
      errorMsg = "Invalid email address.";
      break;
    case "auth/weak-password":
      errorMsg = "password Must be 6 or above characters";
      break;
    case "auth/invalid-credential":
      errorMsg = "invalid credential";
      break;
    case "auth/user-disabled":
      errorMsg =
        "Your account has been suspended. Please contact the administrator.";
      break;
    case "auth/user-not-found":
      errorMsg = "No user found. Please sign up.";
      break;
    case "auth/wrong-password":
      errorMsg = "Incorrect password.";
      break;
    case "auth/network-request-failed":
      errorMsg = "Network issue. Please try again.";
      break;
    case "auth/too-many-requests":
      errorMsg = "Too many requests. Please try again later.";
    case "auth/email-already-in-use":
      errorMsg = "The email address is already in use.";
      break;
    default:
      errorMsg = e.message;
  }
  NotifyUser("error", errorMsg, 3500);
};

// Function to update UI elements for logged in user
const updateUIForLoggedInUser = (uid, userName) => {
  if (!uid) {
    document.querySelector("#reg").innerHTML = `
      <div id="signuppage" class="button"><a href="#">Login</a></div>
    `;
    document.querySelector("#reg_footer").onclick = () => {
      document.querySelector(".overlay1").classList.add("fade-in");
      document.querySelector(".overlay1").classList.remove("fade-out");
      document.querySelector("#loginForm").classList.remove("none");
    };
    document.querySelector("#signuppage").onclick = () => {
      document.querySelector(".overlay1").classList.add("fade-in");
      document.querySelector(".overlay1").classList.remove("fade-out");
      document.querySelector("#loginForm").classList.remove("none");
    };
  } else {
    document.querySelector("#reg_footer").classList.add("none");
    document.querySelector(".overlay1").classList.remove("fade-in");
    document.querySelector(".overlay1").classList.add("fade-out");
    document.querySelector("#loginForm").classList.add("none");
    document.querySelector("#reg").innerHTML = `
      <div class="profile" id="profile">
        <div class="img-box">
          <img src="./static/media/profile.png" alt="Profile Image" />
        </div>
      </div>
      <div class="profile-menu" id="profilemenu">
        <h4 style="text-align:center">${userName}</h4>
        <hr>
        <ul>
          <li><a href="./static/profile/profile.html"><i class="fa fa-user"></i> Profile</a></li>
          <li><a href="#" id="signout"><i class="fa fa-sign-out"></i> Sign Out</a></li>
        </ul>
      </div>
    `;
    document.querySelector("#signout").addEventListener("click", () => {
      if (confirm("Are you sure you want to log out?")) {
        signOutUser();
      }
    });
    document.querySelector(".profile").onclick = () => {
      document.querySelector(".profile-menu").classList.toggle("active");
    };
  }
};

// Function to sign out user
const signOutUser = () => {
  document.querySelector("#reg_footer").classList.remove("none");

  updateUserStatus(userAuthUid, false);
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      sessionStorage.removeItem("userid<@#(1029384756)#@>");
      sessionStorage.removeItem("LOgiN#@$%^&;;");
      NotifyUser("success", "Logged out successfully.", 2000);
      setTimeout(() => location.reload(), 2000);
    })
    .catch((error) => {
      NotifyUser("error", "Something Went Wrong Please try Agian!.", 2000);

      console.log("error while sign out", error);
    });
};

// Check if user is already authenticated
if (userAuthUid) {
  getUserData(userAuthUid);
} else {
  updateUIForLoggedInUser(null, null);
}

// Event listeners for UI elements----------------------------------
document.querySelector("label.signup").onclick = () => {
  document.querySelector("form.Forgot-password").classList.add("none");
  document.querySelector(".title-text .signup").textContent = "SignUp Form";

  document.querySelector("form.signup").classList.remove("none");
  document.querySelector("form.login").style.marginLeft = "-50%";

  document.querySelector(".title-text .login").style.marginLeft = "-50%";
};

document.querySelector("label.login").onclick = () => {
  document.querySelector("form.signup").classList.add("none");
  document.querySelector(".title-text .signup").textContent = "SignUp Form";

  document.querySelector("form.Forgot-password").classList.add("none");

  document.querySelector("form.login").style.marginLeft = "0%";
  document.querySelector(".title-text .login").style.marginLeft = "0%";
};
document.querySelector(".pass-link").onclick = () => {
  document.querySelector("form.Forgot-password").classList.remove("none");
  document.querySelector("form.login").style.marginLeft = "-50%";
  document.querySelector(".title-text .login").style.marginLeft = "-50%";
  document.querySelector(".title-text .signup").textContent = "forgot Password";
};
document.querySelector("form .remembered a").onclick = () => {
  document.querySelector("label.login").click();
  return false;
};
document.querySelector("form .Back-to-login").onclick = () => {
  document.querySelector("label.login").click();
  return false;
};
document.querySelector("form .signup-link a").onclick = () => {
  document.querySelector("label.signup").click();
  return false;
};
//--------------------------------------------------------------------------
document.querySelector(".close").onclick = () => {
  document.querySelector(".overlay1").classList.remove("fade-in");
  document.querySelector(".overlay1").classList.add("fade-out");
  document.querySelector("#loginForm").classList.add("none");
};

document.querySelector(".overlay1").onclick = () => {
  document.querySelector(".overlay1").classList.add("fade-out");
  document.querySelector(".overlay1").classList.remove("fade-in");
  document.querySelector("#loginForm").classList.add("none");
  document.querySelector("#anime-details").classList.add("none");
};
