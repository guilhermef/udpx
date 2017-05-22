const udp = require('dgram')
const uuid = require('uuid/v4')

const client = udp.createSocket('udp4')
const id = uuid()
let count = 0

client.on('message', (msg, info) => {
  const message = msg.toString()
  console.log(`Data received from server : ${message}`)
  if (message === 'ping') {
    console.log(info)
    client.send(JSON.stringify({ id, action: 'pong' }), info.port, info.address)
  }
})


client.send(JSON.stringify({ id, action: 'entry' }), 8080, 'localhost', (error) => {
  if (error) {
    client.close()
  } else {
    console.log('Data sent !!!')
  }
})

setInterval(() => {
  client.send(JSON.stringify({ id, action: 'jump', count }), 8080, 'localhost')
  count += 1
}, 300)
