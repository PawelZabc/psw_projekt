
const url = "http://localhost:3000"

const token = sessionStorage.getItem("auth_key")
// const name = window.location.href.split("/").at(-1)

async function init_get(){
    const user = await axios.get(`${url}/api/user`,{headers: {
        Authorisation: 'Bearer ' + token 
      }}).then(res=>res.data.user).catch(x=>false)
    //   console.log(user)
      if (user){
        Object.keys(user).forEach(x=>{
            document.getElementById("info").innerHTML += `<p>${x}:${user[x]}</p>`
        })
        const button = document.createElement("button");
        button.onclick = async ()=>{
            console.log(user.name)
            const response = await axios.delete(`${url}/api/account/${user.name}`,{headers: {
                Authorisation: 'Bearer ' + token 
              }})
              console.log(response)
            
        }
        button.innerHTML = "delete account"
        document.getElementById("info").appendChild(button)
      }else{
        document.getElementById("info").innerHTML = `not logged in`
      }


      
      
        
    }

init_get()

// document.getElementById("delete").onclick = 

