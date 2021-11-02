let postsContainer = document.querySelector('.postsContainer');

async function getPosts() {
  const options = {method: 'GET'};
  const getData = await fetch(`/api/posts/${postId}`, options);
  const response = await getData.json();
  outPutPostsWithReplies(response, postsContainer);
}

getPosts();




















