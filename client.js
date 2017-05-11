const udp = require('dgram')
const uuid = require('uuid/v4')

const client = udp.createSocket('udp4')

client.on('message', (msg) => {
  console.log(`Data received from server : ${msg.toString()}`)
})


client.send(JSON.stringify({ id: uuid() }), 8080, 'localhost', (error) => {
  if (error) {
    client.close()
  } else {
    console.log('Data sent !!!')
  }
})
