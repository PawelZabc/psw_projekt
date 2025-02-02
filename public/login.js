const username_input = document.getElementById("username-input")
const password_input = document.getElementById("password-input")


const form = document.getElementById("login-form")
const url = "http://localhost:3000"

form.onsubmit = (evt)=>{
    username=username_input.value
    password=password_input.value
    axios.post(`${evt}/api/login`,{username:username,password:password})
    console.log(username,password)
    evt.preventDefault()
}