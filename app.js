function getTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

let index = 0;
for (const { duration, end, householder, me, reader, song, speaker, studentPart, studyPoint, title } of assignments) {
  let seconds = 0;
  let active = false;
  let finished = false;

  const div = document.createElement("div");
  div.className = "assignment";
  const button = document.createElement("button");

  const speakers = [me ? "Dillon" : speaker, householder, reader].filter((n) => n);

  const secondsEl = document.createElement("p");
  secondsEl.className = "seconds";
  const updateTime = (s) => {
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
    /*
          when within threshold, 60? 30 seconds?
          change colors.
          */
  };
  const timer = () => {
    updateTime(seconds + 1);
    if (!finished && active) {
      setTimeout(() => timer(), 1000);
    }
  };
  const finishedEl = document.createElement("input");
  finishedEl.type = "checkbox";
  finishedEl.addEventListener("click", ({ target }) => {
    finished = target.checked;
    div.classList.toggle("finished", finished);
    button.disabled = finished || active;
  });

  const titleEl = document.createElement("div");
  titleEl.className = "title";
  titleEl.appendChild(finishedEl);
  const p = document.createElement("p");
  p.textContent = song ? `Song ${song}` : title;
  titleEl.appendChild(p);
  div.appendChild(titleEl);
  if (0 < speakers.length) {
    const ul = document.createElement("ul");
    for (const speaker of speakers) {
      const li = document.createElement("li");
      li.textContent = speaker;
      ul.appendChild(li);
    }
    div.appendChild(ul);
  }

  if (speaker && studyPoint) {
    const textarea = document.createElement("textarea");
    const id = `counsel-${index}`;
    textarea.id = id;
    textarea.addEventListener("change", ({ target }) => localStorage.setItem(id, target.value));
    const prevContent = localStorage.getItem(id);
    textarea.value = prevContent || `Study Point ${studyPoint}\n`;
    div.appendChild(textarea);
  }

  if (!song) {
    updateTime(0);
    div.appendChild(secondsEl);

    button.textContent = "BEGIN";
    button.addEventListener("click", () => {
      active = !active;
      div.classList.toggle("active", active);
      button.disabled = finished || active;
      if (active) {
        timer();
      }
    });
    div.appendChild(button);
  }

  document.querySelector(".assignments").appendChild(div);
  document.getElementById("clear").addEventListener("click", () => {
    localStorage.clear();
    window.location.reload();
  });

  let counselStart = 0;
  let counselActive = false;
  const counsel = document.querySelector("#counsel");
  const clock = document.querySelector(".counsel-clock");
  const bumpTime = () => {
    const diff = Math.round((Date.now() - counselStart) / 1000);
    clock.textContent = getTime(diff);
    clock.className = ["counsel-clock", 60 < diff ? "danger" : 30 < diff ? "warning" : ""].join(" ");
    if (counselActive) {
      setTimeout(() => bumpTime(), 1000);
    }
  };
  counsel.addEventListener("click", () => {
    counselActive = true;
    counselStart = Date.now();
    bumpTime();
  });
  document.querySelector("#end").addEventListener("click", () => {
    counselActive = false;
    setTimeout(() => (clock.className = "counsel-clock"), 1100);
  });
  index++;
}
