'use strict';

/**
 * Login controller.
 */
angular.module('docs').controller('Login', function(Restangular, $scope, $rootScope, $state, $stateParams, $dialog, User, $translate, $uibModal, $window) {
  $scope.codeRequired = false;

  // Get the app configuration
  Restangular.one('app').get().then(function(data) {
    $rootScope.app = data;
  });

  // Login as guest
  $scope.loginAsGuest = function() {
    $scope.user = {
      username: 'guest',
      password: ''
    };
    $scope.login();
  };

  // Login
  $scope.login = function() {
    User.login($scope.user).then(function() {
      User.userInfo(true).then(function(data) {
        $rootScope.userInfo = data;
      });

      if($stateParams.redirectState !== undefined && $stateParams.redirectParams !== undefined) {
        $state.go($stateParams.redirectState, JSON.parse($stateParams.redirectParams))
          .catch(function() {
            $state.go('document.default');
          });
      } else {
        $state.go('document.default');
      }
    }, function(data) {
      if (data.data.type === 'ValidationCodeRequired') {
        // A TOTP validation code is required to login
        $scope.codeRequired = true;
      } else {
        // Login truly failed
        var title = $translate.instant('login.login_failed_title');
        var msg = $translate.instant('login.login_failed_message');
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      }
    });
  };

  // Function to open registration page
  $scope.openRegistration = function() {
    // Open a modal for registration instead of new window for better UX
    $uibModal.open({
      templateUrl: 'partial/docs/register.html',
      controller: 'ModalRegister',
      size: 'md'
    }).result.then(function(registeredUser) {
      if (registeredUser) {
        // Auto-fill the login form after successful registration
        $scope.user = {
          username: registeredUser.username,
          password: registeredUser.password
        };
        // Show success message
        var title = $translate.instant('login.registration_success_title');
        var msg = $translate.instant('login.registration_success_message');
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      }
    });
  };

  // Password lost
  $scope.openPasswordLost = function () {
    $uibModal.open({
      templateUrl: 'partial/docs/passwordlost.html',
      controller: 'ModalPasswordLost'
    }).result.then(function (username) {
      if (username === null) {
        return;
      }

      // Send a password lost email
      Restangular.one('user').post('password_lost', {
        username: username
      }).then(function () {
        var title = $translate.instant('login.password_lost_sent_title');
        var msg = $translate.instant('login.password_lost_sent_message', { username: username });
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      }, function () {
        var title = $translate.instant('login.password_lost_error_title');
        var msg = $translate.instant('login.password_lost_error_message');
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      });
    });
  };
});

// Add this new controller for registration modal
angular.module('docs').controller('ModalRegister', function($scope, $uibModalInstance, Restangular, $translate, $dialog) {
  $scope.registration = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  $scope.register = function() {
    // Validate passwords match
    if ($scope.registration.password !== $scope.registration.confirmPassword) {
      var title = $translate.instant('login.registration_error_title');
      var msg = $translate.instant('login.registration_password_mismatch');
      var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns);
      return;
    }

    // Submit registration
    Restangular.one('user').post('register', {
      username: $scope.registration.username,
      email: $scope.registration.email,
      password: $scope.registration.password
    }).then(function() {
      // Return the registered user info to the login controller
      $uibModalInstance.close({
        username: $scope.registration.username,
        password: $scope.registration.password
      });
    }, function(error) {
      var title = $translate.instant('login.registration_error_title');
      var msg = error.data.message || $translate.instant('login.registration_error_message');
      var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns);
    });
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
});