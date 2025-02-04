const socket = io()

const send_button = document.getElementById("send-message-button")
const message_input = document.getElementById("message-input")
const chat_box = document.getElementById("chat-box")
const start_button = document.getElementById("start-button")
const raise_button = document.getElementById("raise-button")
const swap_button = document.getElementById("swap-button")
const check_button = document.getElementById("check-button")
const fold_button = document.getElementById("fold-button")
const player_hand = document.getElementById("hand")
const messages = document.getElementById("messages")
const opponents = document.getElementById("opponents")
const raise_down = document.getElementById("raise-down")
const raise_value = document.getElementById("raise-value")
const raise_up = document.getElementById("raise-up")
const info_box = document.getElementById("info-box")
const table_cards = document.getElementById("table")

raise_down.onclick = ()=>{
    if (raise_value.innerHTML>0){
        raise_value.innerHTML-=5
    }
    
}

raise_up.onclick = ()=>{
    const value=raise_value.innerHTML-0
    raise_value.innerHTML=value+5
}


const opponent_list = []
const hand = []


const token = sessionStorage.getItem("auth_key")
const game_name = window.location.href.split("/").at(-1)

const url = "http://localhost:3000"

const init_get = async()=>{
    const user = await axios.get(`${url}/api/user`,{headers: {
        Authorisation: 'Bearer ' + token 
      }}).then(res=>res.data.user)
    const game = await axios.get(`${url}/api/game/${game_name}`,{headers: {
        Authorisation: 'Bearer ' + token 
      }})
    console.log(game.data)
    game.data.players.forEach(x => {
        if (x!==user.name){
            opponent_list.push(x)
        }
    })
    document.getElementById("name").innerHTML=user.name
    render_opponents()
    if (game.data.cards){
        render_cards(game.data.cards)
    }

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
        // add_message(message_input.value,"you")
    }
    message_input.value = ""
}

start_button.onclick = async () =>{
    // const response = await axios.post(`${url}/api/draw/${game_name}`,{amount:5,replace:[]},{headers: {
    //     Authorisation: 'Bearer ' + token 
    //   }})

    // console.log(response)
    socket.emit("start")
    // start_button.disabled = true
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
}}

check_button.onclick = () =>{
    // console.log("AAA")
    // const response = await fetch(`${url}/check}`, {
    //     method: "POST",
    //     body: JSON.stringify({ hand: hand }),
    //     headers: myHeaders,
    //   });
    // const resp = await response.json()
    // console.log(resp)
    socket.emit("check")
    // add_message("you drew 5 cards","")
    // render_cards(resp.cards)
}

raise_button.onclick = () =>{
    if (raise_value.innerHTML>0){
        socket.emit("raise",{amount:raise_value.innerHTML-0})
    }  
}

fold_button.onclick = () =>{
    socket.emit("fold")
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
    // selected.map((x,i)=>selected[i]=false)
}

const render_table_cards =(cards) =>{
    table_cards.innerHTML= ""
    cards.map((x,i)=>{
        const card = document.createElement("div");
        card.setAttribute("class",`card ${suits[x[0]].color}`)
        // card.onclick = cardClicked(i)
        card.innerHTML=
        `<div class=first>${x[1]}<br>${suits[x[0]].symbol}</div>
            <div class=inner-card></div>

        <div class=second>${x[1]}<br>${suits[x[0]].symbol}</div>`
        table_cards.appendChild(card)
    })
    // selected.map((x,i)=>selected[i]=false)
}


const add_message = (msg,who) => {
    messages.innerHTML+=`<div class=message>${(who)?who+":":""}${msg}</div>`
}

const render_opponents = ()=>{
    opponents.innerHTML= ""
    opponent_list.map((x,i)=>{
        const opponent = document.createElement("div");
        opponent.setAttribute("class",`opponent`)
        // opponent.onclick = cardClicked(i)
        opponent.innerHTML=x
        opponents.appendChild(opponent)
    })
}



socket.on('message',({msg,who})=>{
    // console.log(who,msg)
    // console.log(msg,who)
    add_message(msg,who)
  })
socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });
socket.on("user-joined",(msg)=>{
    if (!opponent_list.some(x=>x===msg)){
    opponent_list.push(msg)
    render_opponents()
    }
    add_message(msg + " joined","")
    
  })
  socket.on("user-left",(msg)=>{
    opponent_list.push(msg)
    console.log(msg)
    render_opponents()
    add_message(msg + " joined","")
  })
socket.on("start", async ()=>{
    add_message("Everyone is ready","")
    const response = await axios.get(`${url}/api/game/${game_name}`,{headers: {
        Authorisation: 'Bearer ' + token 
      }})
    // console.log(response)
    render_cards(response.data.cards)
  })
socket.on("annoucement",({next,bid,cards,msg})=>{
    if (msg){add_message(msg,"")}
    if (next){document.getElementById("next").innerHTML=next}
    if (cards){document.getElementById("cards").innerHTML=next}

})

socket.on("new-number",({number})=>{
    document.getElementById("player-num").innerHTML=`Player ${number}`
})

socket.on("new-waiting",({number})=>{
    document.getElementById("next").innerHTML=`Waiting for player ${number}...`
})

socket.on("new-bid",({number})=>{
    document.getElementById("bid").innerHTML=`Current bid: ${number}`
})

socket.on("new-state",({number,cards})=>{
    document.getElementById("state").innerHTML=`State:${number}`
    render_table_cards(cards)
})



socket.on("ready",({number})=>{
    console.log(`player ${number} is ready`)
})

//   console.log(game_name)

  
