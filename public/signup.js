const username_input = document.getElementById("username-input")
const password_input = document.getElementById("password-input")
const draw_button = document.getElementById("draw")
const message = document.getElementById("login-response")


const form = document.getElementById("login-form")
const url = "http://localhost:3000"

form.onsubmit = async (evt)=>{
    evt.preventDefault()
    username=username_input.value
    password=password_input.value
    if (!username || !password){
        message.innerHTML = "You must enter both username and password"
        return false}
    const response = await axios.post(`${url}/api/signup`,{username:username,password:password})
    .then(resp=>resp)
    .catch(err=>err.response)
    if (response.status===200){
        message.innerHTML = "Account created!"
        sessionStorage.setItem("auth_key",response.data.token)}
    else{
        message.innerHTML = response.data.message}
    
}