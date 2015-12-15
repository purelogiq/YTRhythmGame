/**
 * Initialization script for the index page.
 */
$(function() {
  $(".button-collapse").sideNav();
  $('select').material_select();
  var username = localStorage.getItem("username");
  if(username == null || username == undefined || username == "Anonymous"){
    localStorage.setItem("username", "Anonymous");
    $('#welcome-modal').openModal();
  }
  $("#username").val(localStorage.getItem("username"));
  console.log(localStorage.getItem("username"));
});

function saveUsername(){
  var username = $("#username-input").val().trim();
  if(username == ''){
    username = "Anonymous";
  }
  localStorage.setItem("username", username);
  $("#username").val(username);
};

function joinRoom(roomId, role){
  var username = localStorage.getItem("username");
  window.location.href = '/room/' + roomId + '/?username=' + username + '&role=' + role
};