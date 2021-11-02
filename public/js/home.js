let postsContainer = document.querySelector('.postsContainer');

async function getPosts() {
  const getData = await fetch('/api/posts?'  + new URLSearchParams({ followingOnly: true }));
  const response = await getData.json();
  outPutPosts(response, postsContainer);
}



getPosts();