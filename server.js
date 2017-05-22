const udp = require('dgram')

const server = udp.createSocket('udp4')
const clients = {}

function checkAlive(clientId) {
  const ip = clients[clientId].ip
  const port = clients[clientId].port
  if (clients[clientId].currentTimeout) {
    clearTimeout(clients[clientId].currentTimeout)
  }

  setTimeout(() => {
    server.send('ping', port, ip)
  }, 500)

  clients[clientId].currentTimeout = setTimeout(() => {
    delete clients[clientId]
    console.log(`${clientId} disconnected`)
  }, 1000)
}

server.on('error', (error) => {
  console.log(`Error: ${error}`)
  server.close()
})

server.on('message', (msg, info) => {
  console.log(`Data received from client : ${msg.toString()}`)
  console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port)
  const pMsg = JSON.parse(msg.toString())
  if (pMsg.action === 'entry') {
    clients[pMsg.id] = {
      ip: info.address,
      port: info.port,
      messageCount: 0,
      seq: Array(32).fill(true),
    }
    checkAlive(pMsg.id)
    return
  }

  if (pMsg.action === 'pong') {
    checkAlive(pMsg.id)
    return
  }
  const client = clients[pMsg.id]
  client.seq.unshift(true)
  client.seq.pop()
  for (let i = client.messageCount + 1; i < pMsg.count; i += 1) {
    client.seq.unshift(false)
    client.seq.pop()
  }

  server.send(
    JSON.stringify({
      action: 'ack',
      seq: client.seq,
    }),
    client.port,
    client.ip
  )
})

server.bind(8080)
