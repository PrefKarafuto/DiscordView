// URLのクエリパラメータからbbsnameを取得
const urlParams = new URLSearchParams(window.location.search);
const bbsName = urlParams.get('bbs');

// ページ要素の取得
const datListDiv = document.getElementById('datList');
const pageButtonsDiv = document.getElementById('pageButtons');
const pageTitle = document.getElementById('pageTitle');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// アイテムの数やページ数を管理する変数
const itemsPerPage = 20; // 1ページあたりのアイテム数
let currentPage = 1;
let items = [];
let totalPages = 0;

// fetchBoardTitle 関数内に追加
function fetchBoardTitle(bbsName) {
  fetch(`../${bbsName}/SETTING.TXT`)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const decoder = new TextDecoder('Shift-JIS');
      const data = decoder.decode(buffer);
      const titleMatch = data.match(/BBS_TITLE=(.*)/);
      if (titleMatch && titleMatch[1]) {
        const boardTitle = titleMatch[1];
        pageTitle.textContent = boardTitle; // ページタイトルに表示
        // lineCount の部分にも表示
        const lineCountElement = document.getElementById('lineCount');
        if (lineCountElement) {
          lineCountElement.textContent = boardTitle;
        }

        // <title> 要素の内容も設定
        const titleElement = document.getElementById('Title');
        if (titleElement) {
          titleElement.textContent = boardTitle;
        }
      } else {
        pageTitle.textContent = 'DATファイル選択';
      }
    })
    .catch(error => {
      console.error('Error fetching board title:', error);
      pageTitle.textContent = 'DATファイル選択';
    });
}


searchButton.addEventListener('click', () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm)
  );
  displayFilteredItems(filteredItems);
});

function displayFilteredItems(filteredItems) {
  datListDiv.innerHTML = '';
  const hitCount = filteredItems.length; // ヒットした件数を取得
  const hitCountElement = document.getElementById('hitLineCount');
  
  if (hitCountElement&&hitCount>0) {
    hitCountElement.textContent = `${hitCount}件ヒットしました`;
  } else{
    hitCountElement.textContent = `ヒットなし`;
  }
  // ページごとにアイテムを分割
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
  const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

  for (const item of itemsToDisplay) {
    //const item = filteredItems[i];
    const datLink = document.createElement('a');
    datLink.href = `read.html?bbs=${bbsName}&dat=${item.datFileName.replace('.dat', '')}`;
    
    // デコードされたタイトルを取得し、textContentに設定
    const decodedTitle = document.createElement('textarea');
    decodedTitle.innerHTML = item.title;
    const decodedTitleText = decodedTitle.value;

    datLink.textContent = `${item.number}. ${decodedTitleText}`; // 番号を追加
    
    const datListItem = document.createElement('li');
    datListItem.appendChild(datLink);
    datListDiv.appendChild(datListItem);
  }
  updatePageButtons();
}

// ページボタンを更新する関数
function updatePageButtons() {
  pageButtonsDiv.innerHTML = '';
  const minPage = Math.max(currentPage - 1, 1);
  const maxPage = Math.min(currentPage + 1, totalPages);
  
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

  const pageCounter = document.createElement('div');
  pageCounter.textContent = `${currentPage} / ${totalPages}`; // 総ページ数を表示
  pageCounter.classList.add('page-counter');

  pageButtonsDiv.insertBefore(prevButton, pageButtonsDiv.firstChild);
  pageButtonsDiv.appendChild(nextButton);
  pageButtonsDiv.appendChild(pageCounter);
}

// アイテムを表示する関数
function displayItems(page) {
  datListDiv.innerHTML = '';
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, items.length);

  for (let i = startIndex; i < endIndex; i++) {
    const datLink = document.createElement('a');
    datLink.href = `read.html?bbs=${bbsName}&dat=${items[i].datFileName.replace('.dat','')}`;
    
    // デコードされたタイトルを取得し、textContentに設定
    const decodedTitle = document.createElement('textarea');
    decodedTitle.innerHTML = items[i].title;
    const decodedTitleText = decodedTitle.value;
    const itemNumber = i + 1; // 番号を計算
    datLink.textContent = `${itemNumber}. ${decodedTitleText}`; // 番号とタイトルを表示
    
    const datListItem = document.createElement('li');
    datListItem.appendChild(datLink);
    datListDiv.appendChild(datListItem);
  }
  const itemCountElement = document.getElementById('itemCount');
  if (itemCountElement) {
    itemCountElement.textContent = `全${items.length}スレッド`;
  }
  updatePageButtons();
}

if (!bbsName) {
  console.error('bbsname not specified.');
  datListDiv.innerHTML = '<p style="color: red;">bbsnameが指定されていません。</p>';
} else {
  fetchBoardTitle(bbsName);

  fetch(`../${bbsName}/subject.txt`)
    .then(response => response.arrayBuffer())  // データをバイナリとして読み込む
    .then(buffer => {
      const decoder = new TextDecoder('shift-jis');  // Shift-JIS エンコーディングでデコード
      const data = decoder.decode(buffer);
      const lines = data.split('\n')
        .filter(line => line.trim() !== '\n');  // 空行を除外

      // 最後の要素を削除
      if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }

      items = lines.map((line,index) => {
        const [datFileName, titleandNum] = line.split('<>');
        const [title, resNum] = titleandNum.split(/(\s+\(\d+\))$/);
        return { datFileName, title,number: index + 1 ,resNum};
      });

      totalPages = Math.ceil(items.length / itemsPerPage);
      updatePageButtons();
      displayItems(currentPage);
    })
    .catch(error => {
      console.error('Error fetching subject:', error);
      datListDiv.innerHTML = '<p style="color: red;">データの読み込みエラーが発生しました。</p>';
    });
}
// 検索ボタンクリックと同様の処理を実行する関数
function performSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm === '') {
    return; // 検索文字列が空の場合は処理を中断
  }
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm)
  );
  displayFilteredItems(filteredItems);
}

// Enterキーで検索するイベントを追加
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault(); // フォームの送信を防ぐ
    performSearch();
  }
});

// 検索ボタンクリック時のイベント
searchButton.addEventListener('click', event => {
  event.preventDefault(); // フォームの送信を防ぐ
  performSearch();
});
