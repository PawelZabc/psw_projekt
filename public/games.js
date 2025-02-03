
const name_input = document.getElementById("name-input")
const draw_button = document.getElementById("draw")
const message = document.getElementById("create-response")
const games = document.getElementById("games") 


const form = document.getElementById("login-form")
const url = "http://localhost:3000"

form.onsubmit = async (evt)=>{
    evt.preventDefault()
    const name=name_input.value

    if (!name){
        message.innerHTML = "You must enter a name!"
        return false}
    const token = sessionStorage.getItem("auth_key")
    const response = await axios.post(`${url}/api/create-poker`,{name:name},{headers: {
        Authorisation: 'Bearer ' + token 
      }})
    .then(resp=>resp)
    .catch(err=>err.response)
    console.log(response)
    if (response.status===200){
        message.innerHTML = "Game created!"
        get_games()}
    else if(response.status===400){
        message.innerHTML = response.data.message  }
    else{
        message.innerHTML = "You must be logged in to create a game!"}
    
    
}

const gameClicked = async (evt) =>{
    evt.preventDefault()
    const name = evt.target.innerHTML
    console.log(name)
    const token = sessionStorage.getItem("auth_key")
    const response = await axios.post(`${url}/api/join-game`,{name:name},{headers: {
        Authorisation: 'Bearer ' + token 
      }})
    if (response.status===200){
        window.location.href=evt.target.href
    }
}


const get_games = async () =>{
    const response = await axios.get(`${url}/api/poker`)
    const games_list = response.data.games
    games.innerHTML=""
    if (games_list){

        games_list.map(x=>{
            const child = document.createElement("a");
            child.onclick = gameClicked
            child.innerHTML=
            `<a href="${url}/game/${x.name}">${x.name}</a>`
            games.appendChild(child)
        })
    }
    else{
        games.innerHTML="<p>Games couldn't be found</p>"
    }
}

get_games()