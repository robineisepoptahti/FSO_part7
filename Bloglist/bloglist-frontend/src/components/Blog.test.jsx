import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import BlogForm from './BlogForm'
import { describe, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import user from '../../../bloglist_backend/models/user'

const mockBlog = {
  author: 'janne',
  title: 'Jannen kirja',
  url: 'www.test.fi',
  likes: 5,
  user: {
    name: 'jannesson',
    username: 'janskuli',
  },
}

describe('Blog component tests', () => {
  const mockUpdateLikes = vi.fn()
  const mockRemoveBlog = vi.fn()
  test('renders Blog title', async () => {
    render(
      <Blog
        blog={mockBlog}
        updateLikes={mockUpdateLikes}
        removeBlog={mockRemoveBlog}
      />
    )
    const author = screen.getByText('janne', { exact: false })
    const title = screen.getByText('Jannen kirja', { exact: false })
    const likes = screen.queryByText('likes', { exact: false })
    const url = screen.queryByText('www.test.fi', { exact: false })
    screen.debug()
    expect(author).toBeDefined()
    expect(title).toBeDefined()
    expect(likes).toBeNull()
    expect(url).toBeNull()
  })

  test('see if likes and url are rendered after opening expanded view', async () => {
    render(
      <Blog
        blog={mockBlog}
        updateLikes={mockUpdateLikes}
        removeBlog={mockRemoveBlog}
      />
    )
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)
    const likes = screen.getByText('likes', { exact: false })
    const url = screen.getByText('www.test.fi', { exact: false })
    screen.debug()
    expect(likes).toBeDefined()
    expect(url).toBeDefined()
  })

  test('see if clicking button twice produces 2 function calls', async () => {
    render(
      <Blog
        blog={mockBlog}
        updateLikes={mockUpdateLikes}
        removeBlog={mockRemoveBlog}
      />
    )
    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)
    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)
    expect(mockUpdateLikes.mock.calls).toHaveLength(2)
  })
})

describe('BlogForm component tests', () => {
  const mockHandleSubmit = vi.fn()
  test('Form is submiited with correct paramters', async () => {
    render(<BlogForm handleSubmit={mockHandleSubmit} />)
    const user = userEvent.setup()
    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], 'Lintukirja')
    await user.type(inputs[1], 'Kalle')
    await user.type(inputs[2], 'www.lintukirja.fi')
    const viewButton = screen.getByText('submit')
    await user.click(viewButton)
    expect(mockHandleSubmit.mock.calls).toHaveLength(1)
    expect(mockHandleSubmit.mock.calls[0][0].title).toBe('Lintukirja')
    expect(mockHandleSubmit.mock.calls[0][0].author).toBe('Kalle')
    expect(mockHandleSubmit.mock.calls[0][0].url).toBe('www.lintukirja.fi')
  })
})
