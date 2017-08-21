

var options = {
  rememberLastLogin: false,
  theme: {
    logo: 'https://serverless-stories.netlify.com/phil.jpg',
    primaryColor: '#0d2f52',
    labeledSubmitButton: false
  },
  languageDictionary: {
    title: "Client Area"
  },
  auth: {
    redirectUrl: 'https://serverless-stories.netlify.com/admin',
    responseType: 'token id_token'
  }
};

var lock = new Auth0Lock('djk9b6nLgKKKCTdVs1kVyHoL1jko5xNl', 'adesmier.eu.auth0.com', options);

// The login function once invoked will display the Lock widget
// Upon successful login, we'll store the user profile and token in localStorage
function login(){
  lock.show();
};

lock.on("authenticated", function(authResult) {
  lock.getUserInfo(authResult.accessToken, function(error, profile) {
    if (error) {
      return alert(error.message);
    }

    localStorage.setItem('accessToken', authResult.idToken);
    localStorage.setItem('profile', JSON.stringify(profile));

    updateAuthenticationStatus();
  });
});


// The logout function, will remove the user information and token from localStorage
function logout(){
  localStorage.removeItem('profile');
  localStorage.removeItem('accessToken');
  updateAuthenticationStatus();
};



// The getUser helper function will get the current status of our user
// and display user information or a link to login if there is no
// authenticated user
function updateAuthenticationStatus(){
  $('#user').empty();
  $('#login').empty();
  var user = localStorage.getItem('profile');
  if(user){
    user = JSON.parse(user);
    $('#user').show().append('<a onclick="logout()">' + user.email + ' (Log out)</a>');
    $('#admin-page').append('<a href="https://serverless-stories.netlify.com/admin">Admin</a>');
    $('#login').hide();
  } else {
    $('#login').show().append('<a onclick="login()">Log in</a>');
    $('#user').hide();
  }
}

// Any time a page is loaded, we'll check to see if there is a user.

var interval = null;
var counter = 0;

$(document).ready(function(){
  updateAuthenticationStatus();
  if(window.location.pathname == '/admin/'){
    console.log('load admin called');
    interval = setInterval(loadAdmin, 500);
  }
});










function loadAdmin(){

    if(localStorage.getItem('accessToken')){
      console.log(localStorage.getItem('accessToken'));
      clearInterval(interval);
      $.ajax({
        type : 'GET',
        url : 'https://webtask.it.auth0.com/api/run/wt-26212ff75758b7d16d19104dea3bca60-0/subscribers/subscribers',
        headers : {
          Authorization : 'Bearer ' + localStorage.getItem('accessToken')
        }
      }).done(function(data) {
        for(var i = 0; i < data.length; i++){
          $('#subscribers').append('<h4>' + data[i] + '</h4>');
        }
      }).fail(function(jqxhr, textStatus, error){
        var err = textStatus + ', ' + error;
        console.log('Request failed with error: ' + err);
      });
    } else {
      console.log('access token doesn\'t exist');
      if(++counter === 3){
        $('#subscribers').append('<h2>Opps! You\'re not allowed here!</h2>');
        clearInterval(interval);
      }
    }

}

$('#newsletter').submit(function(e){
  var email = $('#email').val();
  $.ajax({
    type : 'POST',
    contentType: 'application/json',
    url : 'https://webtask.it.auth0.com/api/run/wt-26212ff75758b7d16d19104dea3bca60-0/subscribers/subscribe',
    data: JSON.stringify({ "email": email }),
    dataType    : 'json'
    // headers : {
    //   Authorization : 'Bearer ' + localStorage.getItem('token')
    // }
  }).done(function(data) {
    if(data.statusCode == 200){
      $('#newsletter').hide();
      $('#response').append('<div class="alert alert-success">'+ data.message +'</div>')
    } else {
      $('#newsletter').hide();
      $('#response').append('<div class="alert alert-danger">'+ data.message +'</div>')
    }
  });
  e.preventDefault();
})

