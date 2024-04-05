const net = require('net');

const server = net.createServer((socket) => {
  console.log('Client connected.');

  socket.on('data', (data) => {
    console.log(`Received data from client: ${data}`);
    socket.write('Hello from server!');
  });

  socket.on('end', () => {
    console.log('Client disconnected.');
  });
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server started and listening on port 3000');
});