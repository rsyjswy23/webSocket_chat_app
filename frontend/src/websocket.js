// to create a websocket connection instance
class WebSocketService {
    // static here is to create instance
    static instance = null;
    // handle message based on different commands  
    callbacks = {};
    
    static getInstance() {
      if (!WebSocketService.instance) {
        WebSocketService.instance = new WebSocketService();
      }
      return WebSocketService.instance;
    }
  
    constructor() {
      this.socketRef = null;
    }
  
    connect() {
        // django server
      const path = 'ws://127.0.0.1:8000/ws/chat/test/';
      this.socketRef = new WebSocket(path);
      this.socketRef.onopen = () => {
        console.log('WebSocket open');
      };
      this.socketNewMessage(JSON.stringify({
        command: 'fetch_messages'
      }));
      this.socketRef.onmessage = (e) => {
        this.socketNewMessage(e.data);
      };
      this.socketRef.onerror = (e) => {
        console.log(e.message);
      };
      this.socketRef.onclose = () => {
        console.log("WebSocket closed let's reopen");
        this.connect();
      };
    }
  
    socketNewMessage(data) {
      const parsedData = JSON.parse(data);
      const command = parsedData.command;
      // handle error if no callbacks
      if (Object.keys(this.callbacks).length === 0) {
        return;
      }
      if (command === 'messages') {
        this.callbacks[command](parsedData.messages);
      }
      if (command === 'new_message') {
        this.callbacks[command](parsedData.message);
      }
    }
  
    fetchMessages(username) {
      this.sendMessage({ command: 'fetch_messages', username: username });
    }
  
    newChatMessage(message) {
      this.sendMessage({ command: 'new_message', from: message.from, message: message.content }); 
    }
    // add callback method to dict
    addCallbacks(messagesCallback, newMessageCallback) {
      this.callbacks['messages'] = messagesCallback;
      this.callbacks['new_message'] = newMessageCallback;
    }
  
    sendMessage(data) {
      try {
        this.socketRef.send(JSON.stringify({ ...data })); // create shallow copy of the nested obj
      }
      catch(err) {
        console.log(err.message);
      }  
    }
  
    state() {
      return this.socketRef.readyState;
    }
  
  }
  
  const WebSocketInstance = WebSocketService.getInstance();
  
  export default WebSocketInstance; 