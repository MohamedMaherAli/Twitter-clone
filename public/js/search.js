let timer;
const resultsContainer = document.querySelector('.resultsContainer ');
const searchBox = document.querySelector('#searchBox');
searchBox.addEventListener('keydown', (e) => {
  clearTimeout(timer);
  let value = searchBox.value.trim();
  let searchType = searchBox.getAttribute('data-search');
  timer = setTimeout(async () => {
    value = searchBox.value.trim();
    if(value === "") {
      return resultsContainer.innerHTML = "";
    }
    await search(value, searchType);
  }, 1000);
})

async function search(searchTerm, searchType) {
  let url = searchType === "users" ? "/api/users?" : "/api/posts?";
  if(searchType === "posts") {
    const postData = await fetch( url + new URLSearchParams({search: searchTerm}));
    const response = await postData.json();
    outPutPosts(response, resultsContainer);
  }else {
    const postData = await fetch( url + new URLSearchParams({search: searchTerm}));
    const response = await postData.json();
    outPutUsers(response, resultsContainer);
  } 
}