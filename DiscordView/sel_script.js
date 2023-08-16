// URLのクエリパラメータからbbsnameを取得
const urlParams = new URLSearchParams(window.location.search);
const bbsName = urlParams.get('bbs');

// ページ要素の取得
const datListDiv = document.getElementById('datList');
const pageButtonsDiv = document.getElementById('pageButtons');
const pageTitle = document.getElementById('pageTitle');

// アイテムの数やページ数を管理する変数
const itemsPerPage = 20; // 1ページあたりのアイテム数
let currentPage = 1;
let items = [];
let totalPages = 0;

// 掲示板名を取得する関数
function fetchBoardTitle(bbsName) {
  fetch(`../${bbsName}/SETTING.TXT`)
  .then(response => response.arrayBuffer())
  .then(buffer => {
    const decoder = new TextDecoder('Shift-JIS');
    const data = decoder.decode(buffer);
    const titleMatch = data.match(/BBS_TITLE=(.*)/);
      if (titleMatch && titleMatch[1]) {
        boardTitle = titleMatch[1];
        pageTitle.textContent = boardTitle;
      } else {
        pageTitle.textContent = 'DATファイル選択';
      }
    })
    .catch(error => {
      console.error('Error fetching board title:', error);
      pageTitle.textContent = 'DATファイル選択';
    });
}

// ページボタンを更新する関数
function updatePageButtons() {
  pageButtonsDiv.innerHTML = '';
  const minPage = Math.max(currentPage - 2, 1);
  const maxPage = Math.min(currentPage + 2, totalPages);
  for (let i = minPage; i <= maxPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.disabled = true;
      pageButton.classList.add('current-page');
    }
    pageButton.addEventListener('click', () => {
      currentPage = i;
      updatePageButtons();
      displayItems(currentPage);
    });
    pageButtonsDiv.appendChild(pageButton);
  }
  const prevButton = document.createElement('button');
  prevButton.textContent = '前';
  if (currentPage === 1) {
    prevButton.disabled = true;
  }
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updatePageButtons();
      displayItems(currentPage);
    }
  });
  const nextButton = document.createElement('button');
  nextButton.textContent = '次';
  if (currentPage === totalPages) {
    nextButton.disabled = true;
  }
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updatePageButtons();
      displayItems(currentPage);
    }
  });
  pageButtonsDiv.insertBefore(prevButton, pageButtonsDiv.firstChild);
  pageButtonsDiv.appendChild(nextButton);
}

// アイテムを表示する関数
function displayItems(page) {
  datListDiv.innerHTML = '';
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, items.length);

  for (let i = startIndex; i < endIndex; i++) {
    const datLink = document.createElement('a');
    datLink.href = `read.html?bbs=${bbsName}&dat=${items[i].datFileName.replace('.dat','')}`;
    datLink.textContent = items[i].title;
    const datListItem = document.createElement('li');
    datListItem.appendChild(datLink);
    datListDiv.appendChild(datListItem);
  }

  updatePageButtons();
}

if (!bbsName) {
  console.error('bbsname not specified.');
  datListDiv.innerHTML = '<p style="color: red;">bbsnameが指定されていません。</p>';
} else {
  fetchBoardTitle(bbsName);

  fetch(`../${bbsName}/subject.txt`)
  .then(response => response.arrayBuffer())
  .then(buffer => {
    const decoder = new TextDecoder('Shift-JIS');
    const data = decoder.decode(buffer);
    const lines = data.split('\n');
      items = lines.map(line => {
        const [datFileName, title] = line.split('<>');
        return { datFileName, title };
      });
      totalPages = Math.ceil(items.length / itemsPerPage);
      updatePageButtons();
      displayItems(currentPage);
    });
}
