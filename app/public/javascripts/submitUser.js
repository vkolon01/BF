/**
 This script receives the request to create a new user account with
 given parameters.
 If the given parameters meet the criteria then the acount is created
 otherwise the script returns error message.
 */
$(function(){
    $('.createAccount').submit(function (event) {

        event.preventDefault();
        var errors = new Array(5);
        var unsolvedErrors = false;
        //Searching for errors
        var cleanFirstName = sanitizeForm($('#formFirstName').val(),'First name');
        var cleanLastName = sanitizeForm($('#formLastName').val(),'Last name');
        var cleanUsername = sanitizeForm($('#formUsername').val(),'Username');
        var cleanEmail = sanitizeEmail($('#formEmail').val());
        var password = processPassword($('#formPassword').val(),$('#formPasswordConfirm').val());

        if(cleanFirstName[0] == true){
            errors[0] = cleanFirstName[1];
            unsolvedErrors = true;
        }else{
            errors[0] = "";
        }
        if(cleanLastName[0] == true){
            errors[1] = cleanLastName[1];
            unsolvedErrors = true;
        }else{
            errors[1] = "";
        }
        if(cleanUsername[0] == true){
            errors[2] = cleanUsername[1];
            unsolvedErrors = true;
        }else{
            errors[2] = "";
        }
        if(cleanEmail[0] == true){
            errors[3] = cleanEmail[1];
            unsolvedErrors = true;
        }else{
            errors[3] = "";
        }
        if(password[0] == true){
            errors[4] = password[1];
            unsolvedErrors = true;
        }else{
            errors[4] = "";
        }

        if(unsolvedErrors){
            displayError(errors);
        }else{
            $.post('newUser',{
                firstName: cleanFirstName[1],
                lastName: cleanLastName[1],
                username: cleanUsername[1],
                email: cleanEmail[1],
                pass: password[1]
            })
        }

    });
    function sanitizeForm(form, field) {

        var validatedInput = form.trim().replace(/\uFFFD/g, '');
        var badInput = false;
        var errMessage = "";

        if (validatedInput.length > 50) {
            errMessage += field + " field cannot be over 50 letters long.\n";
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

    function sanitizeEmail(form){
        var errMessage = "";
        var validatedEmail = form.trim().replace(/\uFFFD/g, '');
        var badInput = false;
        if(validatedEmail.length < 1){
            errMessage += "Please provide your email address.\n";
            badInput = true;
        }
        if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(validatedEmail) == false){
            errMessage += "Email contains illegal characters.\n";
            badInput = true;
        }
        if(badInput){
            return [badInput,errMessage];
        }else{

            return [badInput,validatedEmail];
        }
    }
    function processPassword(pass, passConfirm) {
        var errMessage = "";
        var badInput = false;
        if (pass != passConfirm) {
            errMessage += "The confirmation password does not match. \n";
            badInput = true;
        }
        if (pass.length < 8) {
            errMessage += "The password must be at least 8 characters long. \n";
            badInput = true;
        }
        if (badInput) {
            return [badInput, errMessage];
        } else {
            return [badInput,pass];
        }
    }
    function displayError(error){
        $('.error_feedback_firstName').html(error[0]);
        $('.error_feedback_lastName').html(error[1]);
        $('.error_feedback_username').html(error[2]);
        $('.error_feedback_email').html(error[3]);
        $('.error_feedback_password').html(error[4]);
    }

});
