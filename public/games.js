const name_input = document.getElementById("name-input")
const draw_button = document.getElementById("draw")
const message = document.getElementById("create-response")


const form = document.getElementById("login-form")
const url = "http://localhost:3000"

form.onsubmit = async (evt)=>{
    evt.preventDefault()
    const name=name_input.value

    if (!name){
        message.innerHTML = "You must enter a name!"
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