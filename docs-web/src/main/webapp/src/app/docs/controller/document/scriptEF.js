console.log('JavaScript 文件已加载');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 从 URL 中获取 fileId
const urlParams = new URLSearchParams(window.location.search);
const fileId = urlParams.get('fileId');
console.log('fileId:', fileId);

if (!fileId) {
    console.error('fileId 未定义');
    return;
}

const img = new Image();
img.src = `../api/file/${fileId}/data`;
console.log('图片路径:', img.src);

// 存储所有文本对象
const textElements = [];
let selectedText = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// 初始化画布
img.onload = function () {
    console.log('图片加载成功');
    redrawCanvas();
};
img.onerror = function () {
    console.error('图片加载失败');
};

// 重绘画布（包含图片和所有文本）
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 绘制所有文本
    textElements.forEach(text => {
        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        ctx.fillStyle = text.color;
        ctx.fillText(text.content, text.x, text.y);

        // 调试用：显示文本边界框
        // const metrics = ctx.measureText(text.content);
        // ctx.strokeStyle = 'rgba(0,0,255,0.3)';
        // ctx.strokeRect(text.x, text.y - text.fontSize, metrics.width, text.fontSize);
    });
}

// 添加文字功能
document.getElementById('add-text-button').onclick = function () {
    const textContent = prompt('请输入要添加的文字：');
    if (textContent) {
        textElements.push({
            content: textContent,
            x: 50,  // 默认X位置
            y: 50,  // 默认Y位置
            color: 'red',
            fontSize: 30,
            fontFamily: 'Arial'
        });
        redrawCanvas();
    }
};

// 检测点击是否命中文本
function getTextAtPosition(x, y) {
    // 从最新添加的文本开始检查（这样最后添加的文本会显示在最上层）
    for (let i = textElements.length - 1; i >= 0; i--) {
        const text = textElements[i];
        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        const metrics = ctx.measureText(text.content);
        const textHeight = text.fontSize;

        // 检查点击位置是否在文本边界框内
        if (x >= text.x &&
            x <= text.x + metrics.width &&
            y <= text.y &&
            y >= text.y - textHeight) {
            return {
                text: text,
                index: i
            };
        }
    }
    return null;
}

// 鼠标事件处理
canvas.addEventListener('mousedown', function(e) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const clickedText = getTextAtPosition(mouseX, mouseY);
    if (clickedText) {
        selectedText = clickedText.text;
        dragOffsetX = mouseX - selectedText.x;
        dragOffsetY = mouseY - selectedText.y;

        // 将被点击的文本移到数组末尾（使其显示在最上层）
        textElements.splice(clickedText.index, 1);
        textElements.push(selectedText);

        redrawCanvas();
    }
});

canvas.addEventListener('mousemove', function(e) {
    if (selectedText) {
        selectedText.x = e.offsetX - dragOffsetX;
        selectedText.y = e.offsetY - dragOffsetY;
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', function() {
    selectedText = null;
});

canvas.addEventListener('mouseout', function() {
    selectedText = null;
});

// 保存功能
document.getElementById('save-button').onclick = function() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'edited-image.png';
    link.click();
};

// 取消功能
document.getElementById('cancel-button').onclick = function() {
    window.close();
};

// 重置功能
document.getElementById('reset-button').onclick = function() {
    textElements.length = 0;
    redrawCanvas();
};