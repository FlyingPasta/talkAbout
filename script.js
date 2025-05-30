let wordsData = {};
const STORAGE_KEY = "selectedGenres";

window.onload = async () => {
  try {
    const response = await fetch('words.json');
    wordsData = await response.json();
    renderGenreCheckboxes(wordsData);
    restoreGenreSelection();
  } catch (error) {
    console.error("words.jsonの読み込みに失敗:", error);
  }
};

function renderGenreCheckboxes(data) {
  const container = document.getElementById("genres");
  container.innerHTML = "";

  for (const categoryKey in data) {
    const category = data[categoryKey];
    const categoryDiv = document.createElement("details");
    categoryDiv.open = true;

    const summary = document.createElement("summary");
    summary.textContent = category.category;
    categoryDiv.appendChild(summary);

    for (const genreKey in category.genres) {
      const genre = category.genres[genreKey];
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" name="genre" value="${categoryKey}:${genreKey}" onchange="saveGenreSelection()">
        ${genre.label}
      `;
      label.style.display = "block";
      categoryDiv.appendChild(label);
    }

    container.appendChild(categoryDiv);
  }
}

function selectAllGenres(state) {
  const checkboxes = document.querySelectorAll('input[name="genre"]');
  checkboxes.forEach(cb => cb.checked = state);
  saveGenreSelection();
}

function saveGenreSelection() {
  const selected = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
                        .map(cb => cb.value);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
}

function restoreGenreSelection() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const checkboxes = document.querySelectorAll('input[name="genre"]');
  checkboxes.forEach(cb => {
    cb.checked = saved.includes(cb.value);
  });
}

function showRandomWord() {
  const checked = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
                       .map(cb => cb.value);

  if (checked.length === 0) {
    document.getElementById("word").textContent = "ジャンルを選択してください。";
    return;
  }

  let wordPool = [];

  checked.forEach(fullKey => {
    const [catKey, genreKey] = fullKey.split(":");
    const category = wordsData[catKey];
    const genre = category?.genres[genreKey];

    if (genre && genre.words) {
      genre.words.forEach(word => {
        wordPool.push({
          word,
          categoryLabel: category.category,
          genreLabel: genre.label
        });
      });
    }
  });

  if (wordPool.length === 0) {
    document.getElementById("word").textContent = "選ばれたジャンルに単語がありません。";
    return;
  }

  const randomItem = wordPool[Math.floor(Math.random() * wordPool.length)];

  document.getElementById("word").innerHTML = `
    <div class="word-main">${randomItem.word}</div>
    <div class="word-meta">（<strong>${randomItem.categoryLabel}</strong> - <strong>${randomItem.genreLabel}</strong>）</div>
  `;

  addToHistory(randomItem.word);
}


function addToHistory(word) {
  const historyList = document.getElementById("historyList");
  const li = document.createElement("li");
  li.textContent = word;
  historyList.prepend(li);

  while (historyList.children.length > 10) {
    historyList.removeChild(historyList.lastChild);
  }
}
