import React from 'react';
import { useNavigate } from 'react-router-dom';
import  {useSocket}  from '../providers/Socket';
import {useEffect,useState} from "react";
function Home() {
    const navigate=useNavigate();
    const [email,setEmail]=useState("");
    const [code, setCode]=useState("");
    const {socket} =useSocket();
    const handleRoomJoined=({roomId})=>{
        console.log("room-joined",roomId);
        navigate(`/room/${roomId}`);
    };
    useEffect(()=>{
        socket.on("joined-room",handleRoomJoined);
    },[socket]);
    const handleRoomJoin=()=>{
        socket.emit("join-room",{emailId:email,roomId:code});
    };
    return ( <div>
        <input value={email} onChange={e=> setEmail(e.target.value)} placeholder='Enter your email here'/>
       <br /> <input value={code} onChange={e=> setCode(e.target.value)} placeholder='Enter Room Code'/>
       <br /> <button onClick={handleRoomJoin}>Enter Room</button>
    </div> );
}

export default Home;