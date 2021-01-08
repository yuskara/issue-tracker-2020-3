import React, { useState } from 'react'
import { Button } from 'reactstrap'
import '../../App.css'
import logo from '../../images/coding.jpg'
// import ModelPopup from './ModelPopup'
import{ Link } from 'react-router-dom'
import loginService from '../../services/ApiSignIn'
import { useHistory } from 'react-router-dom'

const buttonStyle = { maxWidth: 200, margin: '20px  auto 10px ' }

const UserSignIn = (props) => {
  const history = useHistory()
  //whatever user types reseting the value
  const [values, setValues] = useState({ username: '', password: '', })

  const [pop, setPop] = useState({
    showPopup: false,
    text:'login'
  })
  const handleChange = event => {
    const { name, value } = event.target
    setValues({
      ...values,
      [name]: value
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault() // this way not refreshing when clicking submit
    try {
      const user = await loginService.login({ username:values.username, password:values.password })
      props.setUser(user)
      window.localStorage.setItem(
        'loggedIssueAppUser', JSON.stringify(user)
      )
      console.log('useruser'+user.token)
      loginService.setToken(user.token)
      history.push('/')

    } catch (exception) {
      props.setCheckError(`Error: ${exception.message}`)
      setPop({
        showPopup: !pop.showPopup,
        text:'username or password invalid'
      })
      console.log(exception)
      setTimeout(() => {
        props.setCheckError(null)
      }, 5000)
    }

    setValues({ username: '', password: '' })

  }

  return (
    <div className= "welcome">
      <img className="img-responsive" id="logo" src={logo} alt="logo" />
      <div id='welcome_msg'>
        <h3>Sign in Page</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            name="username"
            type="username"
            placeholder='User Name'
            value={values.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            name="password"
            type="password"
            placeholder='Password'
            value={values.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <div id="welcome_buttons " style={buttonStyle}>
            <Button  color="success" bsstyle="primary" bssize="large" block type="submit"> Log In </Button>
          </div>
          <hr></hr>
          <p>if you are not registered</p>
          <hr></hr>
          <div id="welcome_buttons" style={buttonStyle}>
            <Link to ="/UserSignUp">
              <Button   bsstyle="primary" bssize="large" block>to register </Button>
            </Link>
          </div>
        </div>
        {/* {pop.showPopup ?
          <ModelPopup
            text={pop.text}
          />
          : null
        } */}
      </form>
    </div>
  )
}

export default UserSignIn
