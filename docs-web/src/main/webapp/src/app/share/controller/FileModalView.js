'use strict';

/**
 * File modal view controller.
 */
angular.module('share').controller('FileModalView', function($uibModalInstance, $scope, $state, $stateParams, Restangular, $transitions) {
  // Load files
  Restangular.one('file/list').get({ id: $stateParams.documentId, share: $stateParams.shareId }).then(function(data) {
    $scope.files = data.files;

    // Search current file
    _.each($scope.files, function(value) {
      if (value.id === $stateParams.fileId) {
        $scope.file = value;
      }
    });
  });

  /**
   * Navigate to the next file.
   */
  $scope.nextFile = function() {
    _.each($scope.files, function(value, key) {
      if (value.id === $stateParams.fileId) {
        var next = $scope.files[key + 1];
        if (next) {
          $state.go('share.file', { documentId: $stateParams.documentId, shareId: $stateParams.shareId, fileId: next.id });
        }
      }
    });
  };

  /**
   * Navigate to the previous file.
   */
  $scope.previousFile = function() {
    _.each($scope.files, function(value, key) {
      if (value.id === $stateParams.fileId) {
        var previous = $scope.files[key - 1];
        if (previous) {
          $state.go('share.file', { documentId: $stateParams.documentId, shareId: $stateParams.shareId,  fileId: previous.id });
        }
      }
    });
  };

  /**
   * Open the file in a new window.
   */
  $scope.openFile = function() {
    window.open('../api/file/' + $stateParams.fileId + '/data?share=' + $stateParams.shareId);
  };

  /**
   * Print the file.
   */
  $scope.printFile = function() {
    var popup = window.open('../api/file/' + $stateParams.fileId + '/data', '_blank');
    popup.onload = function () {
      popup.print();
      popup.close();
    }
  };

  /**
   * edit the file
   */

  $scope.editFile = function () {
      // 实现编辑图片的逻辑
      var editWindow = window.open('../api/file/' + $stateParams.fileId + '/edit', '_blank');
      editWindow.onload = function () {
          // 设置背景颜色为白色
          editWindow.document.body.style.backgroundColor = 'white';

          // 创建按钮容器
          var buttonContainer = editWindow.document.createElement('div');
          buttonContainer.style.position = 'fixed';
          buttonContainer.style.top = '10px';
          buttonContainer.style.right = '10px';
          buttonContainer.style.zIndex = '1000';

          // 创建按钮
          var saveButton = editWindow.document.createElement('button');
          saveButton.innerText = '保存';
          saveButton.onclick = function () {
              // 保存逻辑
              alert('保存成功');
          };

          var cancelButton = editWindow.document.createElement('button');
          cancelButton.innerText = '取消';
          cancelButton.onclick = function () {
              // 取消逻辑
              editWindow.close();
          };

          var resetButton = editWindow.document.createElement('button');
          resetButton.innerText = '重置';
          resetButton.onclick = function () {
              // 重置逻辑
              alert('已重置');
          };

          // 添加按钮到容器
          buttonContainer.appendChild(saveButton);
          buttonContainer.appendChild(cancelButton);
          buttonContainer.appendChild(resetButton);

          // 添加按钮容器到文档
          editWindow.document.body.appendChild(buttonContainer);

          // 在这里可以添加更多编辑逻辑，例如加载编辑工具等
      };
  };

  /**
   * Close the file preview.
   */
  $scope.closeFile = function () {
    $uibModalInstance.dismiss();
  };

  // Close the modal when the user exits this state
  var off = $transitions.onStart({}, function(transition) {
    if (!$uibModalInstance.closed) {
      if (transition.to().name === $state.current.name) {
        $uibModalInstance.close();
      } else {
        $uibModalInstance.dismiss();
      }
    }
    off();
  });
});