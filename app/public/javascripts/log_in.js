$(function(){
   $('.logIn').submit(function(event){
       event.preventDefault();
       $.post('log_in',{
           username: $('#formUsername').val(),
           password : $('#formPassword').val()
       });
   });
});