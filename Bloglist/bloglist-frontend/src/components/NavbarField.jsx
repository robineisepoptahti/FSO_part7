import { Navbar, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Button } from './styles'

const NavbarField = ({ user }) => {
  const dispatch = useDispatch()
  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      bg="light"
      data-bs-theme="light"
      style={{ border: '1px solid black' }}
    >
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/users">
            Users
          </Nav.Link>
          <Nav.Link as={Link} to="/">
            Blogs
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
      <p style={{ marginRight: '15px' }}>{user} logged in </p>
      <Button
        style={{ marginRight: '15px' }}
        onClick={() => {
          dispatch({ type: 'REMOVEUSER' })
          window.localStorage.removeItem('loggedBlogappUser')
        }}
      >
        logout
      </Button>
    </Navbar>
  )
}
export default NavbarField
