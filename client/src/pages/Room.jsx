import React, { useEffect, useCallback, useRef, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import { useParams } from "react-router-dom";

function Room() {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    addIceCandidate,
  } = usePeer();

  const { roomId } = useParams();

  const [remoteEmail, setRemoteEmail] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Get camera
  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      sendStream(stream);
      localVideoRef.current.srcObject = stream;
    };

    init();
  }, [sendStream]);

  // ICE handling
  useEffect(() => {
    peer.onicecandidate = (event) => {
      if (event.candidate && remoteEmail) {
        socket.emit("ice-candidate", {
          emailId: remoteEmail,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };
  }, [peer, socket, remoteEmail]);

  const handleUserJoined = useCallback(async ({ emailId }) => {
    setRemoteEmail(emailId);

    const offer = await createOffer();

    socket.emit("call-user", {
      emailId,
      offer,
    });
  }, [createOffer, socket]);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    setRemoteEmail(from);

    const ans = await createAnswer(offer);

    socket.emit("call-accepted", {
      emailId: from,
      ans,
    });
  }, [createAnswer, socket]);

  const handleCallAccepted = useCallback(async ({ ans }) => {
    await setRemoteAns(ans);
  }, [setRemoteAns]);

  const handleIceCandidate = useCallback(async ({ candidate }) => {
    await addIceCandidate(candidate);
  }, [addIceCandidate]);

  useEffect(() => {
    socket.on("User-joined", handleUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("User-joined", handleUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleIceCandidate,
  ]);

  return (
    <div>
      <h2>Room: {roomId}</h2>

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={{ width: 300 }}
      />

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: 300 }}
      />
    </div>
  );
}

export default Room;
