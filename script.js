let wordsData = {};

const STORAGE_KEY = "selectedGenres";
const CATEGORY_STATE_KEY = "categoryOpenState";


/* =========================
   初期処理
   ========================= */

window.onload = async () => {

  try {

    const response = await fetch("words.json");

    if (!response.ok) {
      throw new Error("words.jsonの読み込みに失敗しました。");
    }

    wordsData = await response.json();

    renderGenreCheckboxes(wordsData);
    restoreGenreSelection();
    updateAllCategoryCheckboxes();

  } catch (error) {

    console.error(error);

    document.getElementById("genres").textContent =
      "データの読み込みに失敗しました。";
  }
};


/* =========================
   ジャンル一覧を生成
   ========================= */

function renderGenreCheckboxes(data) {

  const container = document.getElementById("genres");

  container.innerHTML = "";

  // 保存されているカテゴリの開閉状態
  const savedCategoryState = JSON.parse(
    localStorage.getItem(CATEGORY_STATE_KEY) || "{}"
  );


  for (const [categoryKey, category] of Object.entries(data)) {

    const categoryDiv = document.createElement("details");

    // カテゴリキーを直接紐づける
    categoryDiv.dataset.categoryKey = categoryKey;

    // 保存された状態があれば復元
    // 保存されていなければ閉じる
    categoryDiv.open =
      savedCategoryState[categoryKey] ?? false;


    /* =========================
       カテゴリ見出し
       ========================= */

    const summary = document.createElement("summary");

    const categoryCheckbox =
      document.createElement("input");

    categoryCheckbox.type = "checkbox";

    categoryCheckbox.className =
      "category-checkbox";

    categoryCheckbox.dataset.categoryKey =
      categoryKey;


    /*
     * チェックボックスをクリックしたときに
     * details の開閉まで発生しないようにする
     */
    categoryCheckbox.addEventListener("click", event => {
      event.stopPropagation();
    });


    /*
     * カテゴリ単位で全選択・全解除
     */
    categoryCheckbox.addEventListener("change", () => {

      setCategoryGenres(
        categoryKey,
        categoryCheckbox.checked
      );

    });


    const categoryName =
      document.createElement("span");

    categoryName.className =
      "category-name";

    categoryName.textContent =
      category.category;

    summary.appendChild(categoryCheckbox);
    summary.appendChild(categoryName);

    categoryDiv.appendChild(summary);


    /* =========================
       ジャンル一覧
       ========================= */

    for (const [genreKey, genre] of Object.entries(category.genres)) {

      const label = document.createElement("label");

      const genreCheckbox =
        document.createElement("input");

      genreCheckbox.type = "checkbox";

      genreCheckbox.name = "genre";

      genreCheckbox.value =
        `${categoryKey}:${genreKey}`;

      /*
       * カテゴリキーを保持
       * 後でカテゴリの状態更新に使用
       */
      genreCheckbox.dataset.categoryKey =
        categoryKey;


      /*
       * ジャンルを変更したら
       * カテゴリチェックボックスの状態も更新
       */
      genreCheckbox.addEventListener("change", () => {

        saveGenreSelection();

        updateCategoryCheckbox(categoryKey);

      });


      label.appendChild(genreCheckbox);
      label.appendChild(
        document.createTextNode(` ${genre.label}`)
      );

      categoryDiv.appendChild(label);
    }


    /* =========================
       カテゴリ開閉状態を保存
       ========================= */

    categoryDiv.addEventListener(
      "toggle",
      saveCategoryState
    );


    container.appendChild(categoryDiv);
  }
}


/* =========================
   カテゴリ内を全選択・全解除
   ========================= */

function setCategoryGenres(
  categoryKey,
  checked
) {

  const checkboxes =
    document.querySelectorAll(
      `input[name="genre"][data-category-key="${categoryKey}"]`
    );


  checkboxes.forEach(checkbox => {
    checkbox.checked = checked;
  });


  saveGenreSelection();

  updateCategoryCheckbox(categoryKey);
}


/* =========================
   カテゴリチェックボックスを更新
   ========================= */

function updateCategoryCheckbox(categoryKey) {

  const categoryCheckbox =
    document.querySelector(
      `.category-checkbox[data-category-key="${categoryKey}"]`
    );


  if (!categoryCheckbox) {
    return;
  }


  const genreCheckboxes =
    document.querySelectorAll(
      `input[name="genre"][data-category-key="${categoryKey}"]`
    );


  const total =
    genreCheckboxes.length;


  const checked =
    Array.from(genreCheckboxes)
      .filter(checkbox => checkbox.checked)
      .length;


  /*
   * すべて選択
   */
  if (checked === total && total > 0) {

    categoryCheckbox.checked = true;
    categoryCheckbox.indeterminate = false;

  }

  /*
   * 一部だけ選択
   */
  else if (checked > 0) {

    categoryCheckbox.checked = false;
    categoryCheckbox.indeterminate = true;

  }

  /*
   * 何も選択されていない
   */
  else {

    categoryCheckbox.checked = false;
    categoryCheckbox.indeterminate = false;

  }
}


/* =========================
   すべてのカテゴリチェック状態を更新
   ========================= */

function updateAllCategoryCheckboxes() {

  for (const categoryKey of Object.keys(wordsData)) {

    updateCategoryCheckbox(categoryKey);

  }
}


/* =========================
   全ジャンル選択 / 全ジャンル解除
   ========================= */

function selectAllGenres(state) {

  const checkboxes =
    document.querySelectorAll(
      'input[name="genre"]'
    );


  checkboxes.forEach(checkbox => {
    checkbox.checked = state;
  });


  saveGenreSelection();

  updateAllCategoryCheckboxes();
}


/* =========================
   ジャンル選択状態を保存
   ========================= */

function saveGenreSelection() {

  const selected =
    Array.from(
      document.querySelectorAll(
        'input[name="genre"]:checked'
      )
    ).map(checkbox => checkbox.value);


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(selected)
  );
}


/* =========================
   ジャンル選択状態を復元
   ========================= */

function restoreGenreSelection() {

  const saved =
    JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );


  const checkboxes =
    document.querySelectorAll(
      'input[name="genre"]'
    );


  checkboxes.forEach(checkbox => {

    checkbox.checked =
      saved.includes(checkbox.value);

  });


  updateAllCategoryCheckboxes();
}


/* =========================
   カテゴリ開閉状態を保存
   ========================= */

function saveCategoryState() {

  const state = {};

  const categories =
    document.querySelectorAll("#genres details");


  categories.forEach(details => {

    const categoryKey =
      details.dataset.categoryKey;

    state[categoryKey] =
      details.open;

  });


  localStorage.setItem(
    CATEGORY_STATE_KEY,
    JSON.stringify(state)
  );
}


/* =========================
   ランダム単語表示
   ========================= */

function showRandomWord() {

  const checked =
    Array.from(
      document.querySelectorAll(
        'input[name="genre"]:checked'
      )
    ).map(checkbox => checkbox.value);


  const wordElement =
    document.getElementById("word");


  if (checked.length === 0) {

    wordElement.innerHTML = `
      <div class="word-main">
        ジャンルを選択してください。
      </div>
    `;

    return;
  }


  let wordPool = [];


  checked.forEach(fullKey => {

    const [
      categoryKey,
      genreKey
    ] = fullKey.split(":");


    const category =
      wordsData[categoryKey];


    const genre =
      category?.genres[genreKey];


    if (
      genre &&
      Array.isArray(genre.words)
    ) {

      genre.words.forEach(word => {

        wordPool.push({
          word: word,
          categoryLabel: category.category,
          genreLabel: genre.label
        });

      });
    }

  });


  if (wordPool.length === 0) {

    wordElement.innerHTML = `
      <div class="word-main">
        選ばれたジャンルに単語がありません。
      </div>
    `;

    return;
  }


  const randomItem =
    wordPool[
    Math.floor(
      Math.random() * wordPool.length
    )
    ];


  wordElement.innerHTML = `
    <div class="word-main">
      ${randomItem.word}
    </div>

    <div class="word-meta">
      （カテゴリ:
      <strong>${randomItem.categoryLabel}</strong>
      /
      ジャンル:
      <strong>${randomItem.genreLabel}</strong>）
    </div>
  `;


  addToHistory(randomItem.word);
}


/* =========================
   履歴
   ========================= */

function addToHistory(word) {

  const historyList =
    document.getElementById("historyList");


  const li =
    document.createElement("li");


  li.textContent = word;


  historyList.prepend(li);


  while (
    historyList.children.length > 30
  ) {

    historyList.removeChild(
      historyList.lastChild
    );

  }
}
