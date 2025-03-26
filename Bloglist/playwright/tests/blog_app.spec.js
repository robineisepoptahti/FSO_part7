const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, validateLikesOrder } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByTestId('loginform')).toBeVisible()
  })
})

describe('Login', () => {
    
    beforeEach(async ({ page, request }) => {
        await request.post('http://localhost:3003/api/testing/reset')
        await request.post('http://localhost:3003/api/users', {data :{name: 'Salley',
          username: 'Servonen',
          password: 'salainen'
        }
    }
      
          )
        await page.goto('http://localhost:5173')
        })
    
    test('succeeds with correct credentials', async ({ page }) => {
        await page.getByTestId('username').fill('Servonen')
        await page.getByTestId('password').fill('salainen')
        await page.getByRole('button', { name: 'login' }).click()
        await expect(page.getByText(`logout`)).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
        await page.getByTestId('username').fill('zervo')
        await page.getByTestId('password').fill('dddddd')
        await page.getByRole('button', { name: 'login' }).click()
        const errorDiv = await page.locator('.error')
        await expect(errorDiv).toContainText('wrong credentials')
    })
  })



  describe('When logged in', () => {

    beforeEach(async ({ page, request }) => {
      await request.post('http://localhost:3003/api/testing/reset')
      await request.post('http://localhost:3003/api/users', {
          data: {
              name: 'Kalle',
              username: 'zervo',
              password: 'salainen'
          }
        })
      await page.goto('http://localhost:5173')
      await loginWith(page, 'zervo', 'salainen')
      await page.getByRole('button', { name: 'create' }).click()
      await createBlog(page, 'Lintukirja', 'Kalle', 'www.lintukirja.fi')
      })

    test('a new blog can be created', async ({ page }) => {
      const msgDiv = await page.locator('.msg')
      await expect(msgDiv).toContainText('a new blog Lintukirja by Kalle added')
      await expect(page.getByText(`Lintukirja Kalle`)).toBeVisible()
    })
    test ('a blog can be liked', async ({page}) => {
    await page.getByRole('button', { name: 'view' }).click()
    await page.getByText('likes 0').waitFor()
    await page.getByRole('button', { name: 'like' }).click()
    await page.getByText('likes 1').waitFor()
    })
    test ('the blog adder can remove the blog', async ({page}) => {
      page.on('dialog', dialog => dialog.accept()) //Dialog handler
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByText('likes 0').waitFor()
      await expect(page.getByText(`remove`)).toBeVisible()
      await page.getByRole('button', { name: 'remove' }).click()
      const msgDiv = await page.locator('.msg')
      await expect(msgDiv).toContainText('Lintukirja removed')
    })
    test ('only the adder cannot see remove button', async ({page, request}) => {
      await request.post('http://localhost:3003/api/users', {
        data: {
            name: 'Timo',
            username: 'timppa',
            password: 'password'
        }})
      await page.getByText('view').waitFor()
      await page.getByRole('button', { name: 'logout' }).click()
      //await page.getByText('login').waitFor()
      await loginWith(page, 'timppa', 'password')
      await page.getByText('view').waitFor()
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByText('likes 0').waitFor()
      await expect(page.getByText('remove')).toBeHidden()
      await page.getByRole('button', { name: 'logout' }).click()
    })

    test('test if blogs are ordered by like amounts', async ({page}) => {
      //await page.getByText('Lintukirja').waitFor()
      await createBlog(page, 'Lintukirjo', 'Kalle', 'www.lintukirja.fi')
      await createBlog(page, 'Lintukirja3', 'Kalle', 'www.lintukirja.fi')
      const buttonList = page.getByRole('button', { name: 'view' }).all()
      // Opening expanded view for all blogs
      await page.getByRole('button', { name: 'view' }).last().click()
      await page.getByRole('button', { name: 'view' }).last().click()
      await page.getByRole('button', { name: 'view' }).last().click()
      //Starting to press likes
      await page.getByRole('button', { name: 'like' }).last().click()
      await page.getByText('likes 1').waitFor()
      await page.getByRole('button', { name: 'like' }).first().click()
      await page.getByText('likes 2').waitFor()
      expect(await validateLikesOrder(page)).toBe(true)
      await page.getByRole('button', { name: 'like' }).last().click()
      await page.getByText('likes 1').waitFor()
      expect(await validateLikesOrder(page)).toBe(true)
        })
    })
