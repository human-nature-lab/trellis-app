<script setup lang="ts">
import { getTrellisConnection, getTrellisConfigConnection } from '@/db'
import { User } from '@/db/entities/trellis'
import { Log } from '@/db/entities/config'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const users = ref<User[]>([])
async function testDb () {
  console.log('testDb')
  const conn = await getTrellisConnection()
  try {
    const user = new User()
    user.name = 'John Doe'
    user.email = 'john.doe@example.com'
    await conn.manager.save(user)
    console.log('User saved:', user)
  } catch (e) {
    console.error(e)
  }
  users.value = await conn.manager.find(User)
}

const logs = ref<Log[]>([])
async function testDbConfig () {
  console.log('testDbConfig')
  const conn = await getTrellisConfigConnection()
  try {
    const l = new Log()
    l.id = uuidv4()
    l.message = 'test'
    l.severity = 'info'
    l.createdAt = new Date()
    l.fullMessage = 'test'
    await conn.manager.save(l)
    console.log('Log saved:', l)
  } catch (e) {
    console.error(e)
  }
  logs.value = await conn.manager.find(Log)
}

const pragmaSuccess = ref(false)
async function testPragma () {
  const conn = await getTrellisConnection()
  const runner = conn.createQueryRunner()
  await runner.query('PRAGMA foreign_keys = ON')
  console.log('Pragma set')
  pragmaSuccess.value = true
}

const transactionSuccess = ref(false)
async function testTransaction () {
  const conn = await getTrellisConnection()
  try {
    await conn.transaction(async manager => {
      const user = new User()
      user.name = 'World'
      user.email = 'world@example.com'
      await manager.save(user)
      // throw new Error('test')
    })
    transactionSuccess.value = true
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div>
    <h1>DB Test</h1>
    <v-btn @click="testDb">
      Test DB
    </v-btn>
    <v-btn @click="testDbConfig">
      Test DB Config
    </v-btn>
    <v-btn @click="testPragma">
      Test Pragma {{ pragmaSuccess }}
    </v-btn>
    <v-btn @click="testTransaction">
      Test Transaction {{ transactionSuccess }}
    </v-btn>
    <div
      v-for="user in users"
      :key="user.id"
    >
      {{ user }})
    </div>
    <div
      v-for="log in logs"
      :key="log.id"
    >
      {{ log }})
    </div>
  </div>
</template>
