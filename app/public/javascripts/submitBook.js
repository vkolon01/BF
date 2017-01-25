/**
This script receives the request to create a new book with
 given parameters.
 If the given parameters meet the criteria then the book is created
 otherwise the script returns error message.
 */
$(function(){
    $('.submissionForm').submit(function (event) {
        event.preventDefault();
        var errors = Array(2);
        var unsolvedErrors = false;
        //Searching for errors
        var cleanTitle = sanitizeForm($('#formTitle').val(),'Title');
        var cleanAutor = sanitizeForm($('#formAutor').val(),'Autor');
        var cleanSummary = $('#formSummary').val();

        if(cleanTitle[0] == true){
            errors[0] = cleanTitle[1];
            unsolvedErrors = true;
        }else{
            errors[0] = "";
        }
        if(cleanAutor[0] == true){
            errors[1] = cleanAutor[1];
            unsolvedErrors = true;
        }else{
            errors[1] = "";
        }


        if(unsolvedErrors){
            displayError(errors);
        }else{
            $.post('newBook',{
                title: cleanTitle[1],
                autor: cleanAutor[1],
                summary: cleanSummary
            })
        }

    });
    function sanitizeForm(form, field) {

        validatedInput = form.trim().replace(/\uFFFD/g, '');
        var badInput = false;
        var errMessage = "";

        if (validatedInput.length > 20) {
            errMessage += field + " field must be over 20 letters long.\n";
            badInput = true;
        }
        if (validatedInput.length < 1) {
            errMessage += field + " field cannot be empty.\n";
            badInput = true;
        }
        if (/^[a-zA-Z0-9- ]*$/.test(validatedInput) == false) {
            errMessage += field + " field contains illegal characters.\n";
            badInput = true;
        }
        if (badInput) {
            return [badInput,errMessage];
        } else {
            return [badInput,validatedInput];
        }
    }

    function displayError(errors){
        $('.error_feedback_title').html(errors[0]);
        $('.error_feedback_autor').html(errors[1]);
    }
});
