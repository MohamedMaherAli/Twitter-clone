const resultsContainer = document.querySelector('.resultsContainer');
window.onload= async () => {
  if(selectedTab === 'followers') {
    await loadFollowers()
  }else {
    await loadFollowing();
  }

}


async function loadFollowers() {
  const postData = await fetch(`/api/users/${profileUserId}/followers`);
  const response = await postData.json();
  outPutUsers(response.followers, resultsContainer);
}


async function loadFollowing() {
  const postData = await fetch(`/api/users/${profileUserId}/following`);
  const response = await postData.json();
  outPutUsers(response.following, resultsContainer);
}


