window.addEventListener('DOMContentLoaded', () => {
  const fileContentDiv = document.getElementById('fileContent');
  const titleContainer = document.getElementById('titleContainer');

  if (!titleContainer) {
    console.error('titleContainer element not found.');
    return;
  }

  // URLのクエリパラメータからdatの値を取得
  const urlParams = new URLSearchParams(window.location.search);
  const bbsName = urlParams.get('bbs');
  const datName = urlParams.get('dat')+".dat";
  const datFileName = "../"+bbsName+"/dat/"+datName;
  if (!datFileName) {
    console.error('DAT file name not specified.');
    return;
  }

  fetch(datFileName) // URLに取得したDATファイル名を使用
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const decoder = new TextDecoder('Shift-JIS');
      const data = decoder.decode(buffer);
      const lines = data.split('\n');
      const title = lines[0].split('<>')[4];
      titleContainer.textContent = title;

      let currentPost = {};
      let postId = 1; // 初期ID

      lines.slice(0).forEach(line => {
        const parts = line.replace(/<br>/g,'\n').replace(/<hr>/g,'!&lt;hr&gt;!')
        .replace(/<[A-Za-z0-9_"':\/?=& .,]+>/g,'')
        .replace(/\n/g,'<br>').replace(/!&lt;hr&gt;!/g,'<hr>').split('<>');
        if (parts.length === 5) {
          if (currentPost.content) {
            displayPost(currentPost, postId);
            postId++;
          }
          currentPost = {
            name: parts[0],
            email: parts[1],
            datetime: parts[2].replace(/ ID:(.*)/, ''),
            id: parts[2].match(/ID:(.*)/) ? parts[2].match(/ID:(.*)/)[1] : '',
            content: parts[3],
            title: parts[4]
          };
          
        } else {
          currentPost.content += '\n' + line;
        }
      });
      if (currentPost.content) {
        displayPost(currentPost, postId);
      }
    });

  function displayPost(post, postId) {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');
    postDiv.id = `post-${postId}`; // IDを付与

    const nameAndIdDiv = document.createElement('div');
    nameAndIdDiv.classList.add('nameAndId');
    nameAndIdDiv.innerHTML = `${postId} <span class="name">${post.name}</span> ID: ${post.id}`;

    const emailDiv = document.createElement('div');
    emailDiv.classList.add('email');
    emailDiv.textContent = `${post.email}`;

    const datetimeDiv = document.createElement('div');
    datetimeDiv.classList.add('datetime');
    datetimeDiv.textContent = `${post.datetime}`;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    contentDiv.innerHTML = post.content.replace(/https?:\/\/[\w\/,.%&?=-]+/g, '<a href="$&" target="_blank">$&</a>');

    postDiv.appendChild(nameAndIdDiv);
    postDiv.appendChild(emailDiv);
    postDiv.appendChild(datetimeDiv);
    postDiv.appendChild(contentDiv);

    fileContentDiv.appendChild(postDiv);
  }
});
