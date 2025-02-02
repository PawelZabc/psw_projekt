
const username_input = document.getElementById("username-input")
const password_input = document.getElementById("password-input")
const draw_button = document.getElementById("draw")


const form = document.getElementById("login-form")
const url = "http://localhost:3000"

form.onsubmit = async (evt)=>{
    evt.preventDefault()
    username=username_input.value
    password=password_input.value
    const response = await axios.post(`${url}/api/login`,{username:username,password:password}).then((resp)=>{
        return resp
    }).catch((err)=>{
        return false
    })
    if (response){sessionStorage.setItem("auth_key",response.data.token)}
    else{sessionStorage.removeItem("auth_key")}
    // localStorage.setItem("auth_key",response.)
    console.log(response)
    
}

draw_button.onclick = ()=>{
    // const headers = new Headers()
    const token = sessionStorage.getItem("auth_key")
    axios.get(`${url}/draw/5`,{headers: {
        Authorisation: 'Bearer ' + token 
      }})
}