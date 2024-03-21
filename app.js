reqHeader = {
    "X-GitHub-Api-Version": "2022-11-28",
  };
  
  let username = "";
  let counter = 10;
  let page = 1;
  let totalPages = 0;
  
  const grid = document.querySelector(".grid");
  const cardTemplate = document.getElementById("card-template");
  
  function updateButtonState() {
    const button1 = document.querySelector("#prevPage");
    const button2 = document.querySelector("#nextPage");
  
    button1.disabled = page === 1; // Disable prevPage button on first page
    button2.disabled = page === totalPages || totalPages === 1; // Disable nextPage button on last page or if there's only 1 page
  }
  
  const getRepos = (event) => {
    for (let i = 0; i < 3; i++) {
      grid.append(cardTemplate.content.cloneNode(true));
    }
  
    fetch(
      "https://api.github.com/users/" +
        event +
        "/repos?page=" +
        page +
        "&&per_page=" +
        counter,
      {
        headers: reqHeader,
      }
    )
      .then((response) => {
        const linkHeader = response.headers.get("Link");
        if (linkHeader) {
          const lastLink = linkHeader
            .split(",")
            .find((s) => s.includes('rel="last"'));
          if (lastLink) {
            const Pages = new URL(
              lastLink.split(";")[0].trim().slice(1, -1)
            ).searchParams.get("page");
            totalPages = parseInt(Pages);
          }
        } else {
          totalPages = 1;
        }
        if (totalPages < page) {
          page = 1;
          getRepos(username);
          return;
        } else {
          return response.json();
        }
      })
      .then((data) => {
        grid.innerHTML = "";
        data.forEach((element) => {
          const card = cardTemplate.content.cloneNode(true);
          card.querySelector("[repo-title]").textContent = element.name;
          card.querySelector("[repo-language]").textContent = element.language;
          card.querySelector("[repo-description]").textContent =
            element.description;
          grid.append(card);
        });
        updateButtonState();
      });
  };
  
  const profile = document.querySelector(".profile");
  const profileTemplate = document.getElementById("profile-template");
  
  const getUser = (event) => {
    profile.innerHTML = "";
    profile.append(profileTemplate.content.cloneNode(true));
  
    fetch("https://api.github.com/users/" + event, {
      headers: reqHeader,
    })
      .then((response) => response.json())
      .then((data) => {
        profile.innerHTML = "";
        const card = profileTemplate.content.cloneNode(true);
        card.querySelector("[user-name]").textContent = data.name;
        card.querySelector("[user-address]").textContent = data.location;
        card.querySelector("[user-img]").src = data.avatar_url;
        card.querySelector("[user-bio]").textContent = data.bio;
        card.querySelector("[user-repos]").textContent =
          data.public_repos + " repositories";
        profile.append(card);
      })
      .then(() => getRepos(event));
  };
  
  let form = document.querySelector("form");
  
  form.addEventListener("submit", async (event) => {
    if (!(event.target[0].value === "" || username === event.target[0].value)) {
      getUser(event.target[0].value);
      username = event.target[0].value;
    }
    event.preventDefault();
  });
  
  let form2 = document.querySelector("#noOfRepos");
  
  form2.addEventListener("submit", async (event) => {
    if (!(event.target[0].value === "10" || counter === event.target[0].value)) {
      counter = event.target[0].value;
      getRepos(username);
    }
    event.preventDefault();
  });
  
  let button1 = document.querySelector("#prevPage");
  let button2 = document.querySelector("#nextPage");
  
  button1.addEventListener("click", (event) => {
    if (page > 1) {
      page--;
      getRepos(username);
    }
  });
  
  button2.addEventListener("click", (event) => {
    if (page < totalPages) {
      page++;
      getRepos(username);
    }
  });
  
  updateButtonState();