var lock = new Auth0Lock('djk9b6nLgKKKCTdVs1kVyHoL1jko5xNl', 'adesmier.eu.auth0.com', {
  auth: {
    redirectUrl: 'https://serverless-stories.netlify.com/admin',
    responseType: 'token id_token'
  }
});

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

    localStorage.setItem('testToken', JSON.stringify(authResult));
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
$(document).ready(function(){
  updateAuthenticationStatus();
  
});

$(window).on('load', function(){
  if(window.location.pathname == '/admin/'){
    loadAdmin();
  }
});

















// $(document).ready(function(){
//   updateAuthenticationStatus();
//   loadAdmin();
// });
// function logout(){
//   localStorage.removeItem('profile');
//   localStorage.removeItem('token');
//   updateAuthenticationStatus();
// };
// function login(){
//   lock.show(function(err, profile, id_token) {
//     if (err) {
//       return alert(err.message);
//     }
//     localStorage.setItem('profile', JSON.stringify(profile));
//     localStorage.setItem('token', id_token);
//     updateAuthenticationStatus();
//   });
// };

// function updateAuthenticationStatus(){
//   $('#user').empty();
//   $('#login').empty();
//   var user = localStorage.getItem('profile');
//   if(user){
//     user = JSON.parse(user);
//     $('#user').show().append('<a onclick="logout()">' + user.email + ' (Log out)</a>');
//     $('#login').hide();
//   } else {
//     $('#login').show().append('<a onclick="login()">Log in</a>');
//     $('#user').hide();
//   }
// }

function loadAdmin(){

    if(localStorage.getItem('accessToken')){
      console.log(localStorage.getItem('accessToken'));
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
      });
    } else {
      console.log('access token doesn\'t exist');
      //window.location = '/';
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

// $('#tip').submit(function(e){
//   $.ajax({
//     type : 'POST',
//     url : 'https://webtask.it.auth0.com/api/run/wt-kukicadnan-gmail_com-0/tips?access_token=' + localStorage.getItem('token'),
//     data : {message : $('#message').val()},
//     dataType    : 'json'
//   }).done(function(data) {
//     $('#response').empty();
//     if(data.statusCode == 200){
//       $('#tip').hide();
//       $('#response').append('<div class="alert alert-success">'+ data.message +'</div>')
//     } else {
//       $('#tip').hide();
//       $('#response').append('<div class="alert alert-danger">'+ data.message +'</div>')
//     }
//   }).error(function(data){
//     $('#response').empty();
//     if(data.status == 401){
//       $('#response').append('<div class="alert alert-danger">You must be logged in to submit tips. :(</div>')
//     }
//   });
//   e.preventDefault();
// })