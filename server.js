const udp = require('dgram')

const server = udp.createSocket('udp4')
const clients = {}

server.on('error', (error) => {
  console.log(`Error: ${error}`)
  server.close()
})

server.on('message', (msg, info) => {
  console.log(`Data received from client : ${msg.toString()}`)
  console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port)
  const pMsg = JSON.parse(msg.toString())

  clients[pMsg.id] = { ip: info.address, port: info.port }

  server.send('ACK', info.port, info.address, () => {
  })
})

setInterval(() => {
  Object.keys(clients).forEach((key) => {
    const client = clients[key]
    server.send('ping', client.port, client.ip, (error) => {
      if (error) {
        console.log('client down!')
      }
    })
  })
}, 500)

server.bind(8080)
