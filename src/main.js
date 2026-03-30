import { faces } from "./data/faces";

const app = document.getElementById("app");

// --- Simple Router ---
function router() {
  const route = window.location.hash.replace("#", "");
  if (route.startsWith("/game")) {
    const cat = route.split("?cat=")[1];
    renderGame(cat);
  } else if (route === "/dashboard") {
    renderDashboard();
  } else if (route === "/rss") {
    renderFeed();
  } else if (route === "/about") {
    renderAbout();
  } else if (route === "/policy") {
    renderPolicy();
  } else {
    renderCategorySelect();
  }
}
window.addEventListener("hashchange", router);
router();

// --- Pages ---
function renderCategorySelect() {
  // app.innerHTML = `
  // <h1>Select a Category</h1>
  // <button onclick="window.location.hash='/dashboard'">Dashboard</button>
  // `;
  // app.innerHTML = `
  //       <img
  //       src="/face-guess.svg"
  //       alt="Face Guess"
  //       width="100px"
  //       height="100px"
  //     />
  // <button onclick="window.location.hash='/dashboard'">Dashboard</button>
  // `;
  // const dataUrl =
  //   "https://raw.githubusercontent.com/occiandiaali/doyouknowthename/refs/heads/main/data.json";
  // fetch(dataUrl)
  //   .then((response) => response.json())
  //   .then((data) => console.log(data))
  //   .catch((err) => console.error("Error fetching data", err));

  //   fetch("https://raw.githubusercontent.com/occiandiaali/doyouknowthename/refs/heads/main/data.json")
  //   .then(response => response.json())
  //   .then(data => {
  //     // Access each category
  //     console.log(data.science); // Array of science objects
  //     console.log(data.history); // Array of history objects
  //     console.log(data.math);    // Array of math objects
  //     console.log(data.sports);  // Array of sports objects

  //     // Example: loop through science
  //     data.science.forEach(person => {
  //       console.log(person.name);
  //       console.log(person.hints);
  //     });
  //   })
  //   .catch(error => console.error("Error fetching JSON:", error));
  //   Object.keys(data).forEach(category => {
  //   console.log("Category:", category);
  //   console.log("Entries:", data[category]);
  // });

  app.innerHTML = `
        <img
      src="/images/applogo.png"
      alt="famouspersondaily"
      width="200px"
      height="90px"
      class="img-logo"
    />
  <button onclick="window.location.hash='/dashboard'" style="background-color:green;">Dashboard</button><br/>
  <button onclick="window.location.hash='/rss'" style="background-color:brown;">RSS</button><br/>
  `;
  const categories = ["science", "movies", "music", "history", "sports"];
  categories.forEach((cat) => {
    const btn = document.createElement("button");

    btn.textContent = cat;
    btn.onclick = () => {
      const today = new Date().toDateString();
      const lastPlayed = localStorage.getItem("lastPlayed");
      if (lastPlayed === today) {
        alert("You already played today's game! Come back tomorrow.");
        window.location.hash = "/dashboard";
      } else {
        window.location.hash = `/game?cat=${cat}`;
        renderGame(cat);
      }
    };
    app.appendChild(btn);
  });
}

function renderGame(category) {
  app.innerHTML = `<h2 class="challenge-div">${category.toUpperCase()} Challenge</h2>`;

  // Pick one random face per day per category
  const today = new Date().toDateString();
  const key = `daily-${category}-${today}`;
  let data = localStorage.getItem(key);
  if (data) {
    data = JSON.parse(data);
    //console.log("data", data.article);
  } else {
    const options = faces[category];
    const randomFace = options[Math.floor(Math.random() * options.length)];
    data = randomFace;
    // console.log("randomFacedata", data.article);
    localStorage.setItem(key, JSON.stringify(randomFace));
  }

  let guessesLeft = 4;
  let filterLevel = 0;
  const filters = [
    "blur(20px) grayscale(100%)",
    "blur(15px) grayscale(80%)",
    "blur(10px) grayscale(60%)",
    "blur(6px) grayscale(40%)",
    "blur(3px) grayscale(20%)",
    "none",
  ];

  const img = document.createElement("img");
  img.src = data.img;
  // console.log("ImgSrc ", img.src);
  img.style.height = "240px";
  img.style.filter = filters[filterLevel];
  app.appendChild(img);

  const input = document.createElement("input");
  input.placeholder = "Enter name guess...";
  app.appendChild(input);

  const guessBtn = document.createElement("button");
  guessBtn.textContent = "Guess";
  guessBtn.classList.add("guessButton");
  app.appendChild(guessBtn);

  const status = document.createElement("p");
  app.appendChild(status);

  const hintRow = document.createElement("div");
  app.appendChild(hintRow);

  data.hints.forEach((hint) => {
    const btn = document.createElement("button");
    btn.textContent = hint.q;

    btn.onclick = () => {
      if (hint.a) {
        if (filterLevel < filters.length - 1) {
          filterLevel++;
          img.style.filter = filters[filterLevel];
        }
        status.textContent = "Correct hint!";
        btn.style.backgroundColor = "gold";
        btn.style.color = "black";
        btn.disabled = true;
      } else {
        guessesLeft--;
        status.textContent = `Wrong hint. Guesses left: ${guessesLeft}`;
        btn.style.backgroundColor = "red";
        btn.disabled = true;
      }
      if (guessesLeft <= 0) {
        btn.disabled = true;
        btn.style.backgroundColor = "lightgray";
        endGame(false, data.name, category);
      }
    };
    hintRow.appendChild(btn);
  });

  guessBtn.onclick = () => {
    const val = input.value.trim().toLowerCase();
    if (val.length === 0) {
      alert("Type your guess first!");
    } else if (val === data.name) {
      endGame(true, data.name, category);
    } else {
      guessesLeft--;
      status.textContent = `Incorrect. Guesses left: ${guessesLeft}`;
      if (guessesLeft <= 0) {
        endGame(false, data.name, category);
      }
    }
  };

  function endGame(won, answer, category) {
    img.style.filter = "none";
    localStorage.setItem("lastPlayed", today);

    // --- Global streak logic  ---
    const lastDay = localStorage.getItem("lastDay");
    const streak = parseInt(localStorage.getItem("streak") || "0", 10);
    if (lastDay !== today) {
      if (
        lastDay &&
        new Date(lastDay).getTime() === new Date(today).getTime() - 86400000
      ) {
        localStorage.setItem("streak", streak + 1);
      } else {
        localStorage.setItem("streak", 1);
      }
      localStorage.setItem("lastDay", today);
    }

    // --- Per-category streak logic  ---
    const catKeyDay = `lastDay-${category}`;
    const catKeyStreak = `streak-${category}`;
    const lastCatDay = localStorage.getItem(catKeyDay);
    const catStreak = parseInt(localStorage.getItem(catKeyStreak) || "0", 10);

    if (lastCatDay !== today) {
      if (
        lastCatDay &&
        new Date(lastCatDay).getTime() === new Date(today).getTime() - 86400000
      ) {
        localStorage.setItem(catKeyStreak, catStreak + 1);
      } else {
        localStorage.setItem(catKeyStreak, 1);
      }
      localStorage.setItem(catKeyDay, today);
    }

    // status.textContent = won
    //   ? `You got it! It's ${answer}.`
    //   : `Out of guesses! It's ${answer}.`;

    status.textContent = won ? "You got it! It's " : "Out of guesses! It's ";

    const link = document.createElement("a");
    link.href = "#"; //data.article;

    // link.setAttribute("target", "_blank");
    // link.setAttribute("rel", "noopener noreferrer"); // good security practice

    link.textContent = answer;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      renderModal(data.article, answer);
    });

    status.appendChild(link);
    status.append(".");

    const backBtn = document.createElement("button");
    backBtn.textContent = "Dashboard";
    backBtn.onclick = () => (window.location.hash = "/dashboard");
    app.appendChild(backBtn);

    // 🎉 Trigger confetti if won
    if (won) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Share button
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share Result";
    shareBtn.onclick = () => {
      const streak = localStorage.getItem("streak") || 0;
      const catStreak = localStorage.getItem(`streak-${category}`) || 0;
      const text = `🎉 I guessed today's ${category} face (${answer})!\nGlobal streak: ${streak} days\n${category} streak: ${catStreak} days`;
      navigator.clipboard.writeText(text).then(() => {
        alert("Result copied to clipboard!");
      });
    };
    app.appendChild(shareBtn);
  }
}
const modal = document.getElementById("modal");
// const modalTitle = document.getElementById("modal-title");
// const modalBody = document.getElementById("modal-body");
const closeButton = document.querySelector(".close-button");
const modalIframe = document.getElementById("modalIframe");
const loadingIframe = document.getElementById("loadingIframe");
closeButton.addEventListener("click", function () {
  modal.style.display = "none";
});

function renderModal(url, ans) {
  loadingIframe.style.display = "block";
  // modalTitle.textContent = url;
  // modalBody.textContent = "The modal works!";
  modalIframe.title = ans;
  modalIframe.src = url;
  modal.style.display = "block";
  modalIframe.onload = loadingIframe.style.display = "none";
}
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

function renderDashboard() {
  const streak = localStorage.getItem("streak") || 0;
  const scienceStreak = localStorage.getItem("streak-science") || 0;
  const moviesStreak = localStorage.getItem("streak-movies") || 0;
  const musicStreak = localStorage.getItem("streak-music") || 0;
  const historyStreak = localStorage.getItem("streak-history") || 0;
  const sportsStreak = localStorage.getItem("streak-sports") || 0;

  app.innerHTML = `
  <h2 class="dashboard-h2">Dashboard</h2>
      <p>Global streak: ${streak} ${+streak === 1 ? "day" : "days"}</p>
      <p>Science streak: ${scienceStreak} ${+scienceStreak === 1 ? "day" : "days"}</p>
      <p>Movies streak: ${moviesStreak} ${+moviesStreak === 1 ? "day" : "days"}</p>
    <p>Music streak: ${musicStreak} ${+musicStreak === 1 ? "day" : "days"}</p>
    <p>History streak: ${historyStreak} ${+historyStreak === 1 ? "day" : "days"}</p>
    <p>Sports streak: ${sportsStreak} ${+sportsStreak === 1 ? "day" : "days"}</p>
    <p>Badges: ${
      scienceStreak >= 5 ? "🔬 Science Buff " : ""
    }${moviesStreak >= 5 ? "🎞️ Cinema Buff " : ""}${
      musicStreak >= 5 ? "🎵 Music Buff " : ""
    }${historyStreak >= 5 ? "📜 History Buff " : ""}${
      sportsStreak >= 5 ? "🏅 Sports Buff " : ""
    }</p>
    <button onclick="window.location.hash='/'">Home</button>
    `;
  //   <button id="clearBtn">Clear storage</button>
  // document.getElementById("clearBtn").onclick = () => clearStorage();
}
// function clearStorage() {
//   if (window.confirm("Are you sure you want to clear storage?")) {
//     localStorage.removeItem("streak");
//     localStorage.removeItem("lastDay");
//     localStorage.removeItem("streak-science");
//     localStorage.removeItem("streak-movies");
//     localStorage.removeItem("streak-movies");
//     localStorage.removeItem("streak-sports");
//     localStorage.removeItem("streak-history");
//   } else {
//     return;
//   }
// }

function renderFeed() {
  app.innerHTML = `
  <div style="position: relative; width: 100%;min-width:330px;">
  <button style="position:absolute;top:5%;left:3%;z-index:100" onclick="window.location.hash='/'">Home</button>
  <iframe width="328" height="548" src="https://rss.app/embed/v1/wall/tFEkkPbun2w3lCoB" frameborder="0"></iframe>
</div>
  `;
}

function renderAbout() {
  app.innerHTML = `
  <div class="about-div">
  <button onclick="window.location.hash='/'">Home</button>
  <h2>About Us</h2>
  <p>
  We are everyday people who're enthusiastic about the identities and life-stories of humans who have excelled, or simply fascinate us. This site was launched in 2026.
  This site is owned and operated by <a href="https://www.occiandiaali.com">occiandiaali.com</a>, in association with id8 Media.
  </p>
  <h2>Contact Us</h2>
  <form action="" method="get" class="form-example">
  <div class="form-example">
    
    <input type="email" name="email" id="email" placeholder="Your Email" required />
  </div>
    <div class="form-example">
    <textarea rows="4" cols="15" name="message" id="message" placeholder="Message here.."></textarea>
    
  </div>

</form>
</div>
  `;
}

function renderPolicy() {
  app.innerHTML = `
  <div class="policy-div">
  <button onclick="window.location.hash='/'">Home</button>
  <h2>Privacy Policy</h2>
  <p>
  This page is used to inform website visitors regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.

If you choose to use our Service, then you agree to the collection and use of information in relation with this policy. The Personal Information that we collect are used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.
</p>
<p>
<strong>Information Collection and Use</strong>
</p>
<p>
We take and respect your privacy seriously. We may collect information via cookie or web log. This is to customize services and enhance customer satisfaction.

The data we collect are:
</p>
<p>
<strong>Log Data</strong>
</p>
<p>
We want to inform you that whenever you visit our Service, we collect information that your browser sends to us that is called Log Data. This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser version, pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other statistics.
</p>
<p>
<strong>Cookies and Third Party Advertising</strong>
</p>
<p>
Cookies are files with small amount of data that is commonly used an anonymous unique identifier. These are sent to your browser from the website that you visit and are stored on your computer's hard drive.

Our website uses these "cookies" to collection information and to improve our Service. You have the option to either accept or refuse these cookies, and know when a cookie is being sent to your computer. If you choose to refuse our cookies, you may not be able to use some portions of our Service.

We allow third-party companies to serve ads and/or collect certain anonymous information when you visit our web site. These companies may use non-personally identifiable information (e.g., click stream information, browser type, time and date, subject of advertisements clicked or scrolled over) during your visits to this and other Web sites in order to provide advertisements about goods and services likely to be of greater interest to you. These companies typically use a cookie or third party web beacon to collect this information. To learn more about this behavioral advertising practice, you can visit <a href="https://www.cookieyes.com/blog/advertising-cookies/#advertising-cookies">What are cookies</a>
  </p>
 </div> 
  `;
}
