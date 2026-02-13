import React, { useMemo } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

const PeerProvider = ({ children }) => {
  const peer = useMemo(() => {
    return new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });
  }, []);

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const ans = await peer.createAnswer();
    await peer.setLocalDescription(ans);
    return ans;
  };

  const setRemoteAns = async (ans) => {
    await peer.setRemoteDescription(ans);
  };

  const sendStream = (stream) => {
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });
  };

  const addIceCandidate = async (candidate) => {
    await peer.addIceCandidate(candidate);
  };

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAns,
        sendStream,
        addIceCandidate,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export default PeerProvider;
