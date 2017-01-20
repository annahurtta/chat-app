var socket = io();
var chatApp = {
  conncectToChat: function(){
    // on connection to server, ask for user's name with an anonymous callback
    socket.on('connect', function(){
      // call the server-side function 'adduser' and send one parameter (value of prompt)
      socket.emit('adduser', prompt("What's your name?"));
      var windowHeight = $(window).height();
      var NavFooterHeight = ($('.navigation').height()) + ($('.footer').height());
      chatApp.chatHeight = windowHeight - NavFooterHeight;
      $('.chat_container').css('height', chatApp.chatHeight + 'px');
      $('#data').focus();
    });
  },
  sendMessage: function(){
    // listener, whenever the server emits 'updatechat', this updates the chat body
    socket.on('updatechat', function (username, data) {
      $('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
      chatApp.scrollChat();
    });
  },
  changeRoom: function() {
     // listener, whenever the server emits 'updaterooms', this updates the room the client is in
    socket.on('updaterooms', function(rooms, current_room) {
      $('#rooms').empty();
      var current_room_container = $('<div class="current_room"></div>').appendTo('#rooms');
      var available_rooms = $('<div class="available_rooms"><h4>Available rooms:</h4> </div>').appendTo('#rooms');
      $.each(rooms, function(key, value) {
        chatApp.value = value;
        if(value === current_room){
          $('<h4>You are in</h4><p class="myroom"' + chatApp.value + '>' + chatApp.value + '</p>').appendTo(current_room_container);
        }
        else {
          $('<a class="room" data-room="' + chatApp.value + '">' + chatApp.value + '</a>').appendTo(available_rooms);
        }
      });
      chatApp.goToRoom(chatApp.value);
    });
    
  },
  goToRoom:function(){
    $('.room').click(function(room){
      var pickedRoom = $(this).data('room');
      socket.emit('switchRoom', pickedRoom);
      $('#mySidenav').css('width', '0');
    });
  },
  initEvents: function(){
    // when the client clicks SEND
    $('#datasend').click( function(e) {
      e.preventDefault();
      var message = $('#data').val();
      $('#data').val('');
      $('#data').focus();
      // tell server to execute 'sendchat' and send along one parameter
      socket.emit('sendchat', message);
      chatApp.scrollChat();
    });
    // when the client hits ENTER on their keyboard
    $('#data').keypress(function(e) {
      if(e.which == 13) {
        e.preventDefault();
        $(this).blur();
        $('#datasend').focus().click();
        $('#data').focus();
        chatApp.scrollChat();
      }
    });

    //Side nav
    $('.open_nav').click(function(){
      $('#mySidenav').css('width', '250px');
    });
    $('.closebtn').click(function(){
      $('#mySidenav').css('width', '0');
    });
  },
  scrollChat: function(){
    var conversationHeight = $('#conversation').height();
    if(conversationHeight >= chatApp.chatHeight){
      console.log("nyt on korkea")
      $('.chat_container').animate({ scrollTop: conversationHeight});
      console.log($('#conversation').offset().top)
    }
  },
  init: function(){
    chatApp.conncectToChat();
    chatApp.sendMessage();
    chatApp.changeRoom();
    chatApp.initEvents();
  }
}
$(document).ready(function () {
  chatApp.init();
});
