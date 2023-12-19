appState = {
   currentUser:null
}

displayView = function() {

};

window.onload = function() {
 
   if(localStorage.getItem("authToken")){
      
      var scriptElement = document.getElementById("profileView");
      var newDiv = document.createElement("div");
      newDiv.innerHTML = scriptElement.innerHTML;
      var outputElement = document.getElementById("output");
      outputElement.appendChild(newDiv);
      homeView();
      getUserInfo();
      getAllMessages();
      document.getElementById('refreashMessage').addEventListener('click',updateMessageList);
      
   } else{
      var scriptElement = document.getElementById("welcomeViewTemplate");
      var newDiv = document.createElement("div");
      newDiv.innerHTML = scriptElement.innerHTML;
      var outputElement = document.getElementById("output");
      outputElement.appendChild(newDiv);
   }
    
}

function getUserInfo(userinformation){
   var data = userinformation;
   if(userinformation === undefined){
      data = serverstub.getUserDataByToken(localStorage.getItem("authToken")).data
   } else  {
      
      data = userinformation;
   }
   var emailSpan =  document.getElementById("emailHome");
   var firstnameSpan =  document.getElementById("FirstnameHome");
   var familyNameSpan  =  document.getElementById("FamilyNameHome");
   var genderSpan =  document.getElementById("GenderHome");
   var citySpan = document.getElementById("cityHome");
   var countrySpan =  document.getElementById("countryHome");
 
   emailSpan.textContent = data.email;
   firstnameSpan.textContent =  data.firstname;
   familyNameSpan.textContent = data.familyname;
   genderSpan.textContent = data.gender;
   citySpan.textContent = data.city;
   countrySpan.textContent = data.country;
}


function homeView(){
   var HomePanle = document.getElementById("HomePanle");
   HomePanle.style.display = "block";
   var HomePanle = document.getElementById("AccountTab");
   HomePanle.style.display = "none";
   var browesTab = document.getElementById("BrowseTab");
   browesTab.style.display = "none";

   var homeText  = document.getElementById("accountNavText")
   homeText.style.color = "white";
   var homeText  = document.getElementById("browseNavText")
   homeText.style.color = "white";
   var homeText  = document.getElementById("homeNavText")
   homeText.style.color = "red";

}

function accountView(){
   var HomePanle = document.getElementById("HomePanle");
   HomePanle.style.display = "none";
   var browesTab = document.getElementById("BrowseTab");
   browesTab.style.display = "none";
   var HomePanle = document.getElementById("AccountTab");
   HomePanle.style.display = "block";

   var homeText  = document.getElementById("accountNavText")
   homeText.style.color = "red";
   var homeText  = document.getElementById("browseNavText")
   homeText.style.color = "white";
   var homeText  = document.getElementById("homeNavText")
   homeText.style.color = "white";


}

function browseView(){
   var HomePanle = document.getElementById("HomePanle");
   HomePanle.style.display = "none";
   var HomePanle = document.getElementById("AccountTab");
   HomePanle.style.display = "none";
   var browesTab = document.getElementById("BrowseTab");
   browesTab.style.display = "block";


   var homeText  = document.getElementById("accountNavText")
   homeText.style.color = "white";
   var homeText  = document.getElementById("browseNavText")
   homeText.style.color = "red";
   var homeText  = document.getElementById("homeNavText")
   homeText.style.color = "white";

}

function handleSendMessage(event) {
   event.preventDefault();
   var messageInput = document.getElementById("message").value;
   var toUser =  document.getElementById("emailHome").value;  
   var responseMessage = serverstub.postMessage(localStorage.getItem("authToken"),messageInput,toUser);
   var textArea = document.getElementById("message");
   textArea.value = "";
}

function getAllMessages() {
   var responseMessage = serverstub.getUserMessagesByToken(localStorage.getItem("authToken"));
   if(responseMessage.success){
      var messages = responseMessage.data
      updateMessageListUi(messages);
   } else {
      console.log("Something whent wrong");
   }
}


function updateMessageList(){
   var currentUser  = document.getElementById("emailHome").textContent
   var responseMessage = serverstub.getUserMessagesByEmail(localStorage.getItem("authToken"),currentUser);
   if(responseMessage.success){
      var messages = responseMessage.data
      updateMessageListUi(messages)
   }
}


function updateMessageListUi(messages){
   var messageHolder = document.getElementById("messageList");
      messageHolder.innerHTML = '';
      messages.forEach(element => {
         var listItem = document.createElement("li");
         listItem.classList.add('messageItem'); 
         var  writerSpan = document.createElement('span');
         var contentSpan = document.createElement('span');
   
         writerSpan.textContent = `User: ${element.writer}`;
         contentSpan.textContent = `Message: ${element.content}`;
   
         listItem.appendChild(writerSpan);
         listItem.appendChild(contentSpan);

         messageHolder.appendChild(listItem);
      });
}


function showErrorChangePassword(text){
   var errorDiv = document.getElementById("errorNewPSW");
   var errorText = document.getElementById("errorTextPswChange");
   errorDiv.style.display = "block";
   errorText.textContent = text;
}


function changedPassword(event) {
   event.preventDefault();
   var oldPassword = document.getElementById("password").value;
   var newPassword = document.getElementById("passwordNew").value;
   var repeatNewPassword = document.getElementById("repeatPasswordNew").value;
   if(newPassword.length < 6){
      showErrorChangePassword("The password needs to be at least 6 chars long")
      return false;
   }
   else if (newPassword !== repeatNewPassword ){
      showErrorChangePassword("The passwords dose not match");
      return false;
   }
   var responseMessage = serverstub.changePassword(localStorage.getItem("authToken"),oldPassword,newPassword)
   if(!responseMessage.success) {
      showErrorChangePassword(responseMessage.message);
      return false;
   } else {
      var errorDiv = document.getElementById("errorNewPSW");
      var errorText = document.getElementById("errorTextPswChange");
      errorDiv.style.display = "block";
      errorDiv.style.color ="green"
      errorText.textContent = responseMessage.message;
   }
   

}

function searchForUser(event){
   event.preventDefault();
   var errorText = document.getElementById("HomePanle");
   errorText.style.display = "none";
   var username = document.getElementById("userToSearche").value;
   var reponse = serverstub.getUserDataByEmail(localStorage.getItem("authToken"),username);
   if(!reponse.success){
      var errorText = document.getElementById("profileResult");
      errorText.style.display = "block";
      return false;
   }
   var errorText = document.getElementById("profileResult");
   errorText.style.display = "none";
   appState.curerntUser = reponse.data;
   var errorText = document.getElementById("HomePanle");
   errorText.style.display = "block";
   getUserInfo(reponse.data);
}


function signOut(){
   var responseMessage = serverstub.signOut(localStorage.getItem("authToken"));
   if(!responseMessage.success){
      showErrorChangePassword(responseMessage.message)
      return false;
   } else{
      localStorage.removeItem("authToken");
      location.reload();
   }
   
}


function loginUser(){
 
   var password = document.getElementById("password").value;
   var email = document.getElementById("emailInput").value;
  
  
   if (password.length < 6) {
      passwordShortError.style.display = "block";
      return false;
   }

   var message1 = serverstub.signIn(email,password); 
   window.alert(message1.success)
   
   if(!message1.success) {
      window.alert(message1.message);
      passwordMismatchError.style.display = "block";
      return false;
   } 
   localStorage.setItem("authToken", message1.data);
   return true;   
}

function errorAuthDialog(message) {
   errorAuthBox = document.getElementById("passwordError")
   errorText = document.getElementById("errorText")
   errorAuthBox.style.display = "block";
   errorText.value = message;
}


function validatePasswords(){
   
   var password = document.getElementById("passwordSignUp").value;
   var repeatPassword = document.getElementById("repeatPasswordSignUp").value;
   if(password !== repeatPassword) {
      errorAuthDialog("The passwords dose not match");
      return false;
   }

   if (password.length < 6) {
      errorAuthDialog("The password needs to be at lest 6 chars long");
      return false;
   }
   var responseMessage = serverstub.signUp(createUserSignObject());
   window.alert(responseMessage );
   if (!responseMessage.success) {
      errorAuthDialog(responseMessage.message);
      return false;
   }
   errorAuthBox = document.getElementById("passwordError")
   errorAuthBox.style.display = "none";
   return true;
}


function createUserSignObject(){
   var userObject = {
      email: document.getElementById("emailSignUp").value,         
      password: document.getElementById("passwordSignUp").value,     
      firstname: document.getElementById("nameSignUp").value,     
      familyname: document.getElementById("FamilyNameSignUp").value,    
      gender: document.getElementById("gender").value,        
      city: document.getElementById("citySignUp").value,        
      country: document.getElementById("country").value        
    };

    return userObject;
}