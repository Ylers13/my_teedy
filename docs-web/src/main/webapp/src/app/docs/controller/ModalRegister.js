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

    // Submit registration with `disabled: true` (自动禁用)
    Restangular.one('user').put({
      username: $scope.registration.username,
      email: $scope.registration.email,
      password: $scope.registration.password,
      disabled: true // 强制禁用，无需用户手动选择
    }).then(function() {
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