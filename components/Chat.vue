<template>
  <div class="chat-container">
    <div class="messages" ref="messages">
      <div v-for="msg in messages" :key="msg.id" class="message">
        {{ msg.text }}
      </div>
    </div>
    <div class="input-area">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Scrivi un messaggio...">
      <button @click="sendMessage">Invia</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      newMessage: '',
      messageId: 0
    }
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim()) {
        this.messages.push({
          id: ++this.messageId,
          text: this.newMessage
        })
        this.newMessage = ''
        this.$nextTick(() => {
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
        })
      }
    }
  }
}
</script>

<style scoped>
.chat-container {
  height: 400px;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message {
  margin: 5px 0;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 5px;
}

.input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.input-area input {
  flex: 1;
  padding: 8px;
  margin-right: 10px;
}

.input-area button {
  padding: 8px 16px;
}
</style>
