// Create a connection to the signaling server
const socket = io.connect('http://localhost:5000');

// Define local and remote peer connections
let localStream;
let remoteStream;
let peerConnection;

// Configuration for WebRTC
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

// Get local media stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;
    document.getElementById('localVideo').srcObject = stream;

    // Emit 'joinRoom' event to join a specific room
    socket.emit('joinRoom', 'room1');
  })
  .catch(error => console.error('Error accessing media devices.', error));

// Handle incoming signaling data
socket.on('message', async (data) => {
  if (data.offer) {
    peerConnection = new RTCPeerConnection(configuration);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.emit('message', { answer: answer, room: 'room1' });
  } else if (data.answer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  } else if (data.iceCandidate) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
  }
});

// Handle ICE candidates
peerConnection.onicecandidate = event => {
  if (event.candidate) {
    socket.emit('message', { iceCandidate: event.candidate, room: 'room1' });
  }
};

// Display remote video stream
peerConnection.ontrack = event => {
  remoteStream = event.streams[0];
  document.getElementById('remoteVideo').srcObject = remoteStream;
};
