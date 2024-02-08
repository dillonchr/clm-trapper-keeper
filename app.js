function getTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function parseHTML(str) {
  var tmp = document.implementation.createHTMLDocument("");
  tmp.body.innerHTML = str;
  return tmp.body.children[0];
}

let index = 0;
for (const {
  duration,
  end,
  householder,
  me,
  reader,
  song,
  speaker,
  studentPart,
  studyPoint,
  title
} of assignments) {
  let seconds = 0;
  let active = false;
  let finished = false;

  const div = parseHTML(`
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          ${title || "Song " + song}
        </p>
        <span class="card-header-icon timer">&mdash;</span>
      </header>
      <div class="card-content speakers"></div>
      <footer class="card-footer">
        <a href="#" class="start card-footer-item button is-primary">Start</a>
        <a href="#" class="stop card-footer-item button is-danger">Done</a>
        <a href="#" class="start-counsel card-footer-item button is-warning">Counsel</a>
      </footer>
    </div>
  `);
  const button = div.querySelector("a.button.is-primary");

  const speakers = [me ? "Dillon" : speaker, householder, reader].filter(
    n => n
  );

  const secondsEl = div.querySelector("span.timer");
  const updateTime = s => {
    seconds = s;
    secondsEl.textContent = getTime(seconds);
    const durationSecs = duration * 60;
    const diff = durationSecs - seconds;
    if (diff < 0) {
      div.classList.add("danger");
    } else if (diff < 30) {
      div.classList.add("warning");
    } else if (diff < 60) {
      div.classList.add("alert");
    }
  };
  const timer = () => {
    updateTime(seconds + 1);
    if (!finished && active) {
      setTimeout(() => timer(), 1000);
    }
  };
  const finishedEl = div.querySelector("a.stop");
  finishedEl.addEventListener("click", e => {
    e.preventDefault();
    finished = true;
    const d = new Date();
    div.classList.toggle("finished", true);
    button.setAttribute("disabled", "disabled");
    button.classList.remove("is-primary");
    finishedEl.setAttribute("disabled", "disabled");
    finishedEl.innerText = `${d.getHours() - 12}:${String(
      d.getMinutes()
    ).padStart(2, "0")} PM`;
    finishedEl.classList.remove("is-danger");
  });

  if (0 < speakers.length) {
    const ul = document.createElement("ul");
    for (const speaker of speakers) {
      const li = document.createElement("li");
      li.textContent = speaker;
      ul.appendChild(li);
    }
    div.querySelector(".speakers").appendChild(ul);
  }

  const counselButton = div.querySelector(".start-counsel");
  if (speaker && studyPoint) {
    const textarea = document.createElement("textarea");
    const id = `counsel-${index}`;
    textarea.id = id;
    textarea.addEventListener("change", ({ target }) =>
      localStorage.setItem(id, target.value)
    );
    const prevContent = localStorage.getItem(id);
    textarea.value = prevContent || studyPoint + "\n";
    div.querySelector(".speakers").appendChild(textarea);

    let counselStart = 0;
    let counselActive = false;
    const bumpTime = () => {
      if (counselActive) {
        const diff = Math.round((Date.now() - counselStart) / 1000);
        counselButton.textContent = getTime(diff);
        counselButton.className = [
          "start-counsel card-footer-item button",
          59 < diff
            ? "is-danger"
            : 48 < diff
            ? "is-danger is-light"
            : "is-warning is-light"
        ].join(" ");
        setTimeout(() => bumpTime(), 1000);
      }
    };
    counselButton.addEventListener("click", e => {
      e.preventDefault();
      if (counselActive) {
        counselActive = false;
        counselButton.setAttribute("disabled", "disabled");
      } else if (!counselActive && "disabled" !== e.target.getAttribute("disabled")) {
        counselActive = true;
        counselStart = Date.now();
        bumpTime();
      }
    });
  } else {
    counselButton.parentElement.removeChild(counselButton);
  }

  if (!song) {
    updateTime(0);

    button.addEventListener("click", e => {
      e.preventDefault();
      active = !active;
      div.classList.toggle("active", active);
      button.disabled = finished || active;
      if (active) {
        timer();
      }
    });
  } else {
    button.setAttribute("disabled", "disabled");
    button.classList.remove("is-primary");
  }

  document.querySelector(".assignments").appendChild(div);
  document.getElementById("clear").addEventListener("click", () => {
    localStorage.clear();
    window.location.reload();
  });

  index++;
}
