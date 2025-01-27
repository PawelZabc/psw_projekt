"use client"
import next from "next";
import { useState,useEffect } from 'react';
import io from 'socket.io-client';
import ChatBox from "./components/ChatBox";
import { socket } from "../socket"


export default function Home() {
  const [messages,setMessages] = useState([
    // {sender:"server",text:"hello"},
    // {sender:"server",text:"im the server"}
    ])
    
  function onSend(text) {
    const newmessage = {
      sender:"user",
      text:text
    }
    socket.emit("message",text)
    setMessages((prev)=>{return [...prev,newmessage]})
    
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
    <ChatBox messages={messages} onSend={onSend}/>
  )
}
