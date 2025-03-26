const loginWith = async (page, username, password)  => {
    await page.getByTestId('username').fill(username)
    await page.getByTestId('password').fill(password)
    await page.getByRole('button', { name: 'login' }).click()
  }
  
  const createBlog = async (page, title, author, url) => {
    await page.getByTestId('title').waitFor()
    await page.getByTestId('title').fill(title)
    await page.getByTestId('author').fill(author)
    await page.getByTestId('url').fill(url)
    await page.getByRole('button', { name: 'submit' }).click()
    await page.waitForSelector(`text=${title} ${author}`) 
  }

  const validateLikesOrder = async (page) => {
    const likesDivs =  await page.getByTestId('likes').all()
    const likesTexts = await Promise.all(likesDivs.map(div => div.textContent()))
    const likesList = likesTexts.map(text => parseInt(text.replace('likes ', '')))
    console.log(likesList)
    for (let i = 0; i < (likesList.length - 1); i++) {
      console.log("chaw")
      if (likesList[i] < likesList[i + 1]) {
        return false
      }
    }
  return true
  }
  
  export { loginWith, createBlog, validateLikesOrder }