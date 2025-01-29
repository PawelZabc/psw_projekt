"use client"
import next from "next";
import { useState,useEffect } from 'react';
import io from 'socket.io-client';
import ChatBox from "./components/ChatBox";
import { socket } from "../socket"
import Hand from "./components/Hand";
import PokerButtons from "./components/PokerButtons";


export default function Home() {
  const [messages,setMessages] = useState([
    // {sender:"server",text:"hello"},
    // {sender:"server",text:"im the server"}
    ])
  const [selected,setSelected] = useState([false,false,false,false,false])
  const [hand,setHand] = useState([])
    
  function onSend(text) {
    const newmessage = {
      sender:"user",
      text:text
    }
    socket.emit("message",text)
    setMessages((prev)=>{return [...prev,newmessage]})
  }

  async function startClicked(){
    fetch("http://localhost:8080/").then(async (resp)=>{
      const response = await resp.json() 
      console.log(response)
      // setHand(response)
    })
    // socket.emit("start-clicked")
  }

  function click(){
    console.log("clicked")
  }
  useEffect(() => {
    // const socket = io();
    socket.on('message',(msg)=>{
      const newmessage = {
        sender:"user",
        text:`${msg}`
      }
      setMessages((prev)=>{return [...prev,newmessage]})
    })
    socket.on('draw',(cards)=>{
      console.log("drew")
      setHand(cards)
    })


    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    socket.on("user-joined",(msg)=>{
      const newmessage = {
        sender:"server",
        text:`user joined ${msg}`
      }
      setMessages((prev)=>{return [...prev,newmessage]})
    })
    socket.emit("join-room","test")
    // socket.emit('test',"yes")
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div className="game">
    <ChatBox messages={messages} onSend={onSend}/>
    <PokerButtons handleClick={click} startClicked={startClicked}/>
    <Hand hand={hand}/>
    </div>
  )
}
