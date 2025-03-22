console.log('JavaScript 文件已加载');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 从 URL 中获取 fileId
const urlParams = new URLSearchParams(window.location.search);
const fileId = urlParams.get('fileId');
console.log('fileId:', fileId);

if (!fileId) {
    console.error('fileId 未定义');
}

const img = new Image();
img.src = `../../../api/file/${fileId}/data`;
console.log('图片路径:', img.src);

img.onload = function () {
    console.log('图片加载成功');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};
img.onerror = function () {
    console.error('图片加载失败');
};

// 画画功能
let isDrawing = false;

canvas.addEventListener('mousedown', function (e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', function (e) {
    if (isDrawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', function () {
    isDrawing = false;
});

canvas.addEventListener('mouseout', function () {
    isDrawing = false;
});

// 添加文字功能
document.getElementById('add-text-button').onclick = function () {
    const text = prompt('请输入要添加的文字：');
    if (text) {
        const x = 50; // 文字位置 X
        const y = 50; // 文字位置 Y
        ctx.font = '30px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText(text, x, y);
    }
};

// 保存功能
document.getElementById('save-button').onclick = function () {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'edited-image.png';
    link.click();
};

// 取消功能
document.getElementById('cancel-button').onclick = function () {
    window.close();
};

// 重置功能
document.getElementById('reset-button').onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};