angular.module('starter.controllers', ['ionic', 'ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};
    
    $scope.fazerAlgo = function (algumacosa) {
    alert( algumacosa);  
    };

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };
    
$scope.falaAe = function() {
 alert('oi');   
};
    
    $scope.falar = function(a) {
        alert(a);
    };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope, $cordovaCamera, $cordovaImagePicker) {
   $scope.playlists = [
     { title: 'Reggae', id: 1 },
     { title: 'Chill', id: 2 },
     { title: 'Dubstep', id: 3 },
     { title: 'Indie', id: 4 },
     { title: 'Rap', id: 5 },
     { title: 'Cowbell', id: 6 }
   ];

  $scope.alertPlaylistTitle = function (playlist) {
    alert(playlist.title);
  }

  $scope.banana = function (frase) {
    alert(frase);
  }

  $scope.takePicture = function(playlist) {
      alert('oi')
    var options = {
      quality: 50,
      allowEdit: true,
      targetWidth: 100,
      targetHeight: 100,
      saveToPhotoAlbum: false
    };

    $cordovaCamera
      .getPicture(options)
      .then(function(imageData) {
        playlist.image = "data:image/jpeg;base64," + imageData;
      }, function(error) {
        console.warn(error);
      });
    }

    // $scope.pickImage = function() {
    //     var options = {
    //         maximumImagesCount: 10,
    //         width: 800,
    //         height: 800,
    //         quality: 80
    //     };

    //     $cordovaImagePicker.getPictures(options)
    //         .then(function (results) {
    //             var image = document.getElementsByClassName('full-image');
    //             image.src = resutls[0];
    //         }, function(error) {
    //           // error getting photos
    //         });
    // }
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})
