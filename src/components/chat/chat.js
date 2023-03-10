export default class Chat {
  constructor() {
    this.chatWrap = document.querySelector('.chat-app-container');
    this.chatUsers = this.chatWrap.querySelector('.user-online-wrap');
    this.chatInput = this.chatWrap.querySelector('.keybord-block-container');
    this.chatWall = this.chatWrap.querySelector('.chat-window-wall');
    this.userName = undefined;

    this.chatInput.addEventListener('keyup', (e) => {
      // eslint-disable-next-line
      const value = e.target.value;
      if (e.key === 'Enter' && value !== '') {
        e.target.value = '';
        this.ws.send(JSON.stringify(value));
      }
    });
  }

  init(name, serverUrl) {
    this.wsUrl = `${serverUrl.replace('http:', 'ws:')}/`;
    this.userName = name;
    sessionStorage.clear();
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener('open', (e) => {
    });

    this.ws.addEventListener('close', (e) => {
    });

    this.ws.addEventListener('message', (e) => {
      const cData = JSON.parse(e.data);
      let archive;
      Object.entries(cData).forEach((item) => {
        if (item[0] === 'archive') {
          // eslint-disable-next-line
          archive = item[1];
        }
      });

      if (cData && archive) {
        this.clearChat();
        cData.archive.forEach((item) => {
          const archiveObj = item;
          archiveObj.message = archiveObj.message.replace(/"/g, '');
          if (archiveObj.user === this.userName) {
            this.createMessage(archiveObj.user, archiveObj.message, archiveObj.time, 'you');
          } else if (archiveObj.user !== this.userName) {
            this.createMessage(archiveObj.user, archiveObj.message, archiveObj.time, false, 'history');
          }
          this.chatWall.lastElementChild.scrollIntoView();
        });
      }

      if (cData.clients) {
        this.removeFromChat();
        cData.clients.forEach((item) => {
          if (item.name === this.userName) {
            this.addToChat(item, true);
          } else {
            this.addToChat(item);
          }
        });
      }
      if (cData.chat) {
        cData.chat.forEach((item) => {
          const userMessage = item;
          userMessage.message = userMessage.message.replace(/"/g, '');
          if (userMessage.user === this.userName) {
            this.createMessage(userMessage.user, userMessage.message, userMessage.time, true);
          } else {
            this.createMessage(userMessage.user, userMessage.message, userMessage.time);
          }
        });
        this.chatWall.lastElementChild.scrollIntoView();
      }
    });
  }

  createMessage(name, message, time, you = false, history = false) {
    if (you) {
      const youChatMessage = document.createElement('div');
      const youMessageContent = document.createElement('div');
      const youMessageNick = document.createElement('div');
      const youMessageText = document.createElement('span');
      const youMessageDate = document.createElement('div');
      youChatMessage.classList.add('chat-message');
      youChatMessage.classList.add('you-message');
      youMessageContent.classList.add('you-message-content');
      youMessageNick.classList.add('you-message-nick');
      youMessageDate.classList.add('you-message-date');
      youMessageText.classList.add('you-message-text');
      youMessageText.textContent = message;
      youMessageNick.textContent = name;
      youMessageDate.textContent = time;
      youMessageDate.setAttribute('datetime', time);
      youMessageContent.appendChild(youMessageDate);
      youMessageContent.appendChild(youMessageNick);
      youMessageContent.appendChild(youMessageText);
      youChatMessage.appendChild(youMessageContent);
      this.chatWall.appendChild(youChatMessage);
    } else {
      const userMessageChat = document.createElement('div');
      const userMessageContent = document.createElement('div');
      const userMessageNick = document.createElement('div');
      const userMessageText = document.createElement('span');
      const userMessageDate = document.createElement('div');
      userMessageChat.classList.add('chat-message');
      userMessageChat.classList.add('user-message');
      userMessageContent.classList.add('chat-message');
      userMessageNick.classList.add('user-message-nick');
      userMessageText.classList.add('user-message-text');
      userMessageDate.classList.add('user-message-date');
      userMessageText.textContent = message;
      userMessageNick.textContent = name;
      userMessageDate.textContent = time;
      userMessageDate.setAttribute('datetime', time);

      if (history) {
        userMessageContent.classList.add('message-content-history');
      } else userMessageContent.classList.add('user-message-content');

      userMessageContent.appendChild(userMessageDate);
      userMessageContent.appendChild(userMessageNick);
      userMessageContent.appendChild(userMessageText);
      userMessageChat.appendChild(userMessageContent);
      this.chatWall.appendChild(userMessageContent);
    }
  }

  addToChat(user, you = false) {
    this.currentUser = user;
    const userItem = document.createElement('div');
    const userAvatar = document.createElement('div');
    const userNick = document.createElement('div');
    if (you) userNick.classList.add('you-nick');
    userItem.classList.add('user-item');
    userAvatar.classList.add('user-avatar');
    userNick.classList.add('user-nick');
    userNick.textContent = this.currentUser.name;
    userItem.appendChild(userAvatar);
    userItem.appendChild(userNick);
    this.chatUsers.appendChild(userItem);
  }

  removeFromChat() {
    this.allUsers = document.querySelectorAll('.user-item');
    this.allUsers.forEach((item) => {
      item.remove();
    });
  }

  clearChat() {
    this.allMessages = document.querySelectorAll('.chat-message');
    if (this.allMessages) {
      this.allMessages.forEach((item) => {
        item.remove();
      });
    }
  }
}
