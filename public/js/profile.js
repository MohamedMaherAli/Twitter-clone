const postsContainer = document.querySelector('.postsContainer');
const pinnedPostContainer = document.querySelector('.pinnedPostContainer');
window.onload = async () => {
  if(selectedTab === 'replies') {
    loadReplies()
  }else {
    loadPosts();
  }
}


async function loadPosts() {

  // posts  
  const postData = await fetch('/api/posts?' + new URLSearchParams({ postedBy: profileUserId, isReply: false, pinned: false }));
  const response = await postData.json();
  outPutPosts(response, postsContainer);


  // pinned post
  const pinnedPost = await fetch('/api/posts?' + new URLSearchParams({ postedBy: profileUserId, pinned: true }));
  const pinnedResponse = await pinnedPost.json();
  outPutPinnedPosts(pinnedResponse, pinnedPostContainer);
}


async function loadReplies() {
  const postData = await fetch('/api/posts?' + new URLSearchParams({ postedBy: profileUserId, isReply: true }));
  const response = await postData.json();
  outPutPosts(response, postsContainer);
}

function outPutPinnedPosts(result, container) {
  container.innerHTML = "";
  if(result.length === 0) {
    return container.style.display = "none";
  }
  const html = createPostsHtml(result[0]);
  container.insertAdjacentHTML("afterbegin", html);
}