const socket = io()

const send_button = document.getElementById("send-message-button")
const message_input = document.getElementById("message-input")
const chat_box = document.getElementById("chat-box")
const start_button = document.getElementById("start-button")
const swap_button = document.getElementById("swap-button")
const check_button = document.getElementById("check-button")
const player_hand = document.getElementById("hand")
const messages = document.getElementById("messages")
const name_input = document.getElementById("name")

const hand = []


const token = sessionStorage.getItem("auth_key")
const game_name = window.location.href.split("/").at(-1)

const url = "http://localhost:3000"

const init_get = async()=>{
    const user = await axios.get(`${url}/api/user`,{headers: {
        Authorisation: 'Bearer ' + token 
      }}).then(res=>res.data.user)
    // const game = await axios.get(`${url}/api/game/${game_name}`,{headers: {
    //     Authorisation: 'Bearer ' + token 
    //   }})
    // console.log(user)
    // console.log(user)
    socket.emit("join-room",{room:game_name,username:user.name})
}
init_get()
// console.log(user)






const suits = {
    "s" : {"name":"Spade","symbol":"&#9824;","color":"black"},
    "c" : {"name":"Club","symbol":"&#9827;","color":"black"},
    "d" : {"name":"Diamond","symbol":"&#9830;","color":"red"},
    "h" : {"name":"Heart","symbol":"&#9829;","color":"red"}
}


const selected =[false,false,false,false,false]

// axios.post(`${url}/check`,data={hand:["c2","c4"]})

const cardClicked = (id)=>{
    return (env) =>{
        if (env.target.classList.contains("selected"))
            {env.target.classList.remove("selected")
                selected[id] = false
            }
        else{env.target.classList.add("selected")
            selected[id] = true
        }
    }
}

send_button.onclick = async()=>{
    if (message_input.value){
        socket.emit("message",{msg:message_input.value})
        add_message(message_input.value,"you")
    }
    message_input.value = ""
}

start_button.onclick = async () =>{
    // const response = await axios.post(`${url}/api/draw/${game_name}`,{amount:5,replace:[]},{headers: {
    //     Authorisation: 'Bearer ' + token 
    //   }})

    // console.log(response)
    socket.emit("start")
    start_button.disabled = true
    // add_message("you are ready to start","")
    // render_cards(response.data.cards)
}

swap_button.onclick = async () =>{
    const amount = selected.filter(x=>x).length
    if (amount!==0){
    const response = await fetch(`${url}/draw/${amount}`)
    const resp = await response.json()
    socket.emit("swap",{amount:amount})
    add_message(`you swapped ${amount} cards`,"")
    render_cards([...hand.filter((x,i)=>{return !selected[i]}), ...resp.cards])
}

check_button.onclick = async () =>{
    // console.log("AAA")
    // const response = await fetch(`${url}/check}`, {
    //     method: "POST",
    //     body: JSON.stringify({ hand: hand }),
    //     headers: myHeaders,
    //   });
    // const resp = await response.json()
    // console.log(resp)
    // socket.emit("start",name_input.value||"someone")
    // add_message("you drew 5 cards","")
    // render_cards(resp.cards)
}
    
}

const render_cards =(cards) =>{
    hand.splice(0,hand.length)
    player_hand.innerHTML= ""
    cards.map((x,i)=>{
        hand.push(x)
        const card = document.createElement("div");
        card.setAttribute("class",`card ${suits[x[0]].color}`)
        card.onclick = cardClicked(i)
        card.innerHTML=
        `<div class=first>${x[1]}<br>${suits[x[0]].symbol}</div>
            <div class=inner-card></div>

        <div class=second>${x[1]}<br>${suits[x[0]].symbol}</div>`
        player_hand.appendChild(card)
    })
    selected.map((x,i)=>selected[i]=false)

}


const add_message = (msg,who) => {
    messages.innerHTML+=`<div class=message>${(who)?who+":":""}${msg}</div>`
}




socket.on('message',({msg,who})=>{
    console.log(who,msg)
    // console.log(msg,who)
    add_message(msg,who)
  })
socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });
socket.on("user-joined",(msg)=>{
    add_message(msg + " joined","")
  })
socket.on("start", async ()=>{
    add_message("Everyone is ready","")
    const response = await axios.get(`${url}/api/game/${game_name}/start`,{headers: {
        Authorisation: 'Bearer ' + token 
      }})
    render_cards(response.data.cards)
  })

//   console.log(game_name)

  
