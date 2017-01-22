var socket = io();
var chatApp = {
  conncectToChat: function(){
    $('#join').click(function(){
      var username = $('#name').val();
      if (username != '') {
        socket.emit('adduser', username);
        ready = true;
        chatApp.initChatContainer();
        chatApp.updateUsernames();
      }else{
        $('<div class="col-md-6 col-md-offset-3"><h3>Username misssing</h3></div>').appendTo($('.login_container'));
      }
    });

    $('#name').keypress(function(e){
      if(e.which === 13) {
        var username = $('#name').val();
        if (username != '') {
          socket.emit('adduser', username);
          ready = true;
          chatApp.initChatContainer();
          chatApp.updateUsernames();
        }else{
          $('<div class="col-md-6 col-md-offset-3"><h3>Username misssing</h3></div>').appendTo($('.login_container'));
        }
      }
    });
  },
  initChatContainer: function(){
    $('.login_container').remove();
    $('.chat_container').show();
    $('#data').focus();
    $('.footer').show();

    var windowHeight = $(window).height();
    var NavFooterHeight = ($('.navigation').height()) + ($('.footer').height());
    chatApp.chatHeight = windowHeight - NavFooterHeight;
      $('.chat_container').css('height', chatApp.chatHeight + 'px');
  },
  printMessage: function(){
    socket.on('updatechat', function (username, data) {
      $('#conversation').append('<p><span class="username">'+ username + ':</span> ' + data + '</p>');
      chatApp.scrollChat();
    });
  },
  updateUsernames: function(){
    socket.on('updateusers', function(usernames){
      $('#people').empty();
      if(ready) {
        $('<h4>People at Chatti-Appi</h4>').appendTo($("#people"));;
        $.each(usernames, function(clientid, username) {
          $('#people').append("<p>" + username + "</p>");
        });
      }
    });
  },
  changeRoom: function() {
    //list rooms
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
    //if click send
    $('#datasend').click( function(e) {
      e.preventDefault();
      var message = $('#data').val();
      $('#data').val('');
      $('#data').focus();
      socket.emit('sendchat', message);
      chatApp.scrollChat();
    });
    //if hit enter
    $('#data').keypress(function(e) {
      if(e.which === 13) {
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
      $('.chat_container').animate({ scrollTop: conversationHeight});
    }
  },
  init: function(){
    chatApp.conncectToChat();
    chatApp.printMessage();
    chatApp.changeRoom();
    chatApp.initEvents();
  }
}
$(document).ready(function () {
  chatApp.init();
});
