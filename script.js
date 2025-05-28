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
  for (const [key, value] of Object.entries(data)) {
    const label = document.createElement("label");
    label.style.display = "block";
    label.innerHTML = `
      <input type="checkbox" name="genre" value="${key}" onchange="saveGenreSelection()">
      ${value.label}
    `;
    container.appendChild(label);
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

  let combinedWords = [];
  checked.forEach(genreKey => {
    const words = wordsData[genreKey]?.words || [];
    combinedWords = combinedWords.concat(words);
  });

  if (combinedWords.length === 0) {
    document.getElementById("word").textContent = "選ばれたジャンルに単語がありません。";
    return;
  }

  const randomWord = combinedWords[Math.floor(Math.random() * combinedWords.length)];
  document.getElementById("word").textContent = randomWord;

  // 履歴に追加
  addToHistory(randomWord);
}

function addToHistory(word) {
  const historyList = document.getElementById("historyList");
  const li = document.createElement("li");
  li.textContent = word;
  historyList.prepend(li);

  // 上限 10 件
  while (historyList.children.length > 10) {
    historyList.removeChild(historyList.lastChild);
  }
}
