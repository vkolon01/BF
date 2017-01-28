/**
 * Created by Kolodko on 27-Jan-17.
 */
$(function(){
    $('.commentForm').submit(function(event){
        event.preventDefault();
        var comment = $('#commentInput').val();
        if(comment.length < 1){
            $('.error_feedback').html("The post appears to be empty.");
        }else if(comment.length > 100){
            $('.error_feedback').html("Comment cannot have more than 100 characters.");
        }else{
            $.post('newComment',{
                body: comment,
                book_id: $('#id').val(),
                commentAutor: "NOT IMPLEMENTED"
            });
        }
    })
});