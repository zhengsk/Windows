// 事件绑定
var Util = {
    
    event : {

        on: function(element, type, handler) {
            if(element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on"+type,handler);
            } else {
                element["on"+type] = handler;
            }
        },

        off: function(element, type, handler) {
            if(element.removeEventListener) {
                element.removeEventListener(type, handler, false);
            } else if (element.detachEvent) {
                element.detachEvent("on"+type,handler);
            } else {
                element["on"+type] = null;
            }
        },

        getEvent: function(event){
            return event ? event : window.event;
        },

        getPageAxis: function(event) {

            if(event.pageX || event.pageY){
                return {
                    x : event.pageX,
                    y : event.pageY
                }
            }

            var doc = document.documentElement;
            var body = document.body;

            return {
                x : event.clientX +
                    ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                    ( doc && doc.clientLeft || body && body.clientLeft || 0 ),
                y : event.clientY +
                    ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
                    ( doc && doc.clientTop  || body && body.clientTop  || 0 )
            }
        }
    },

    getId : function (id) {
        return document.getElementById(id);
    }
};






function SimpleWindow(opts) {
    this.options = opts;

    this.winParent = opts.parent || document.body;

    this._create(opts.width, opts.height);

    this.init();
}


SimpleWindow.prototype = {

    init : function() {
        this.isMaximize = this.options.maximize || false;
        this.isCollapse = this.options.collapse || false;

        if(this.isMaximize){this.maximize();}
        if(this.isCollapse){this.collapse();}
    },

    // 创建窗口元素 并添加到页面
    _create : function(width, height) {
        var _self = this;

        // winElement
        var winElement = this.winElement = document.createElement('div');
        winElement.className = "simple-window";
        winElement.style.width = width + "px";
        winElement.style.height = height + "px";
        Util.event.on(winElement, 'mousedown', function() {
            _self.moveToFront();
        });

        var winContainer = this.winContainer = document.createElement('div');
        winContainer.className = "simple-window-container";
        winElement.appendChild(winContainer);

        // winHeader
        var winHeader = this.winHeader = document.createElement('div');
        winHeader.className = "simple-window-header";
        winHeader.innerHTML = this.options.title;
        winContainer.appendChild(winHeader);
        Util.event.on(winElement, 'dblclick', function() {
            _self.maximize();
        });

        // winContent
        var winContent = this.winContent = document.createElement('div');
        winContent.className = "simple-window-content";
        winContent.innerHTML = this.options.content;
        winContainer.appendChild(winContent);

        // winFooter
        var winFooter = this.winFooter = document.createElement('div');
        winFooter.className = "simple-window-footer";
        winFooter.innerHTML = this.options.footer;
        winContainer.appendChild(winFooter);

        // 设置位置
        this.moveTo(this.options.top || 0, this.options.left || 0);

        // 添加到页面
        this.winParent.appendChild(winElement);

        // 绑定拖动事件
        this._move(winElement, winHeader);

        // 绑定缩小放大事件
        this._bindResize();

        // 集中管理器
        this._addInstance(this);

        // 移到最前
        this.moveToFront();
    },


    // 移动到实例集合
    _addInstance : function(instance) {
        if(!this.constructor.instances){
            this.constructor.instances = [];
        };
        instance.winElement.style.zIndex = this.constructor.instances.length * 5 + 100;
        this.constructor.instances.push(instance);
    },

    // 从实例集合中移除实例
    _removeInstance : function(instance) {
        var instances = this.constructor.instances
        for(var i = 0, j = instances.length; i < j; i ++){
            if(instances[i] === instance){
                instances.splice(i,1);
                return false;
            };
        }
    },

    // 移动到最前 修改z-index
    moveToFront : function() {
        var instances = this.constructor.instances
        for(var i = 0, j = instances.length; i < j; i ++){
            instances[i].winElement.style.zIndex = i * 5 + 100;
            instances[i].winElement.style.opacity = 0.6;
        }
        this.winElement.style.zIndex = i * 10 + 100;
        this.winElement.style.opacity = 1;
    },

    // 移动窗口位置
    moveTo : function(left, top) {
        var winStyle = this.winElement.style;
        (left !== null) && (winStyle.left = left + "px");
        (top !== null) && (winStyle.top = top + "px");
    },

    // 绑定拖动功能
    _move : function(ele, handler) {

        var _self = this;

        // 鼠标起始位置
        var preMouse = {
            x : null,
            y : null
        }

        // 窗口原始位置
        var prePosition = {
            top : null,
            left : null
        }

        // 窗口大小
        var positionRange = {
            minTop : 0,
            minLeft : 0,
            maxTop : ele.offsetParent.clientHeight - ele.offsetHeight,
            maxLeft : ele.offsetParent.clientWidth - ele.offsetWidth
        }


        // 拖动绑定
        function mouseDown(event) {
            
            event = Util.event.getEvent(event);

            preMouse = Util.event.getPageAxis(event);

            prePosition = {
                top : ele.offsetTop,
                left : ele.offsetLeft
            }

            positionRange.maxTop = ele.offsetParent.clientHeight - ele.offsetHeight;
            positionRange.maxLeft = ele.offsetParent.clientWidth - ele.offsetWidth;

            Util.event.on(document, 'mousemove', mouseMove);
            Util.event.on(document, 'mouseup', mouseUp);
        }

        // 拖动功能
        function mouseMove(event) {
            var currentMouse = Util.event.getPageAxis(event);
            var changedAxis = {
                x : currentMouse.x - preMouse.x,
                y : currentMouse.y - preMouse.y
            }

            var resultX = prePosition.left + changedAxis.x;
            var resultY = prePosition.top + changedAxis.y;

            // 超出范围判断
            resultX = resultX <= positionRange.minLeft ? positionRange.minLeft : resultX;
            resultX = resultX >= positionRange.maxLeft ? positionRange.maxLeft : resultX;

            resultY = resultY <= positionRange.minTop ? positionRange.minTop : resultY;
            resultY = resultY >= positionRange.maxTop ? positionRange.maxTop : resultY;


            _self.moveTo(resultX, resultY)
        }

        // 解绑拖动
        function mouseUp(evetn) {

            Util.event.off(document, 'mousemove', mouseMove);
            Util.event.off(document, 'mouseup', mouseUp);
        }

        Util.event.on(handler, 'mousedown', mouseDown);
    },

    // 设置窗口大小
    resizeTo : function(width, height) {
        var winStyle = this.winElement.style;
        (width !== null) && (winStyle.width = width + "px");
        (height !== null) && (winStyle.height = height + "px");
    },

    _bindResize : function() {
        var _self = this;
        var winElement = this.winElement;

        // 鼠标起始位置
        var preMouse = {
            x : null,
            y : null
        }

        // 窗口原始位置
        var prePosition = {
            left : null,
            top : null
        }

        // 窗口原始大小
        var preSize = {
            width : null,
            height : null
        }

        // 可改变的值
        var changeParam = {
            top : false,
            left : false,
            width : false,
            left : false
        }

        Util.event.on(winElement, 'mousemove', setCursor);

        // 设置鼠标样式
        function setCursor(event) {

            if(_self.resizing || _self.isCollapse || _self.isMaximize){return false};

            _self.resizeAble = true;

            event = Util.event.getEvent(event);

            var cursor = "default";

            var clientRect = _self.winElement.getBoundingClientRect();

            var offsetWdith = clientRect.right - clientRect.left,
                offsetHeight = clientRect.bottom - clientRect.top;

            var x = event.clientX - clientRect.left + (offsetWdith - _self.winElement.clientWidth)/2, 
                y = event.clientY - clientRect.top + (offsetHeight - _self.winElement.clientHeight)/2;

            changeParam.width = changeParam.height = changeParam.top = changeParam.left = false;

            if(x >= 0 && x <= 10){
                cursor = "ew-resize";
                changeParam.width = changeParam.left = true;
                if(y >= 0 && y <= 10){
                    cursor = "nwse-resize";
                    changeParam.height = changeParam.top = true;
                }else if(y >= offsetHeight - 10){
                    cursor = "nesw-resize";
                    changeParam.height = true;
                }
            }else if(x >= offsetWdith - 10){
                cursor = "ew-resize";
                changeParam.width = true;
                if(y >= 0 && y <= 10){
                    cursor = "nesw-resize";
                    changeParam.height = changeParam.top = true;
                }else if(y >= offsetHeight - 10){
                    cursor = "nwse-resize";
                    changeParam.height = true;
                }
            }else if(y >= 0 && y <= 10){
                cursor = "ns-resize";
                changeParam.height = changeParam.top = true;
            }else if(y >= offsetHeight - 10){
                cursor = "ns-resize";
                changeParam.height = true;
            }else{
                cursor = "default";
                _self.resizeAble = false;
            }

            winElement.style.cursor = cursor;
        }

        // 绑定缩小放大功能
        Util.event.on(winElement, 'mousedown', resizeMouseDown);

        function resizeMouseDown(event) {
            if(_self.resizeAble){
                _self.resizing = true;
                preMouse = Util.event.getPageAxis(event);

                preSize = {
                    width : parseInt(_self.winElement.offsetWidth),
                    height : parseInt(_self.winElement.offsetHeight)
                }

                prePosition = {
                    top : _self.winElement.offsetTop,
                    left : _self.winElement.offsetLeft
                }

                Util.event.on(document, 'mousemove', resizeMouseMove);
                Util.event.on(document, 'mouseup', resizeMouseUp);
            }
        }

        function resizeMouseMove(event) {
            event = Util.event.getEvent(event);
            var currentMouse = Util.event.getPageAxis(event);
            var changedAxis = {
                x : currentMouse.x - preMouse.x,
                y : currentMouse.y - preMouse.y
            }

            var left = prePosition.left, 
                top = prePosition.top, 
                width = preSize.width, 
                height = preSize.height;


            if(changeParam.width){
                if(changeParam.left){
                    width = preSize.width - changedAxis.x;
                }else{
                    width = preSize.width + changedAxis.x;
                }
            }

            if(changeParam.height){
                if(changeParam.top){
                    height = preSize.height - changedAxis.y;
                }else{
                    height = preSize.height + changedAxis.y;
                }
            }

            if(changeParam.left){
                left = prePosition.left + changedAxis.x;
                if(changedAxis.x >= preSize.width - _self.options.minWidth){
                    left = prePosition.left + (preSize.width - _self.options.minWidth);
                }
                if(changedAxis.x <= preSize.width - _self.options.maxWidth){
                    left = prePosition.left + (preSize.width - _self.options.maxWidth);
                }
            }

            if(changeParam.top){
                top = prePosition.top + changedAxis.y;
                if(changedAxis.y >= preSize.height - _self.options.minHeight){
                    top = prePosition.top + (preSize.height - _self.options.minHeight);
                }
                if(changedAxis.y <= preSize.height - _self.options.maxHeight){
                    top = prePosition.top + (preSize.height - _self.options.maxHeight);
                }
            }

            // 最大最小宽高限制
            width = width < _self.options.minWidth ? _self.options.minWidth : width;
            width = width > _self.options.maxWidth ? _self.options.maxWidth : width;
            height = height < _self.options.minHeight ? _self.options.minHeight : height;
            height = height > _self.options.maxHeight ? _self.options.maxHeight : height;

            // 缩小放大 大小 父级 范围限制
            width = width + left > _self.winParent.clientWidth ? _self.winParent.clientWidth - left : width;
            height = height + top > _self.winParent.clientHeight ? _self.winParent.clientHeight - top : height;

            // 缩小放大 位置 父级 范围限制
            left = left <= 0 ? 0 : left;
            top = top <= 0 ? 0 : top;

            left == 0 && changeParam.left && (width = preSize.width + prePosition.left);
            top == 0 && changeParam.top && (height = preSize.height + prePosition.top);


            _self.moveTo(left, top);
            _self.resizeTo(width, height);
        }

        function resizeMouseUp(event) {
            if(_self.resizeAble){
                _self.resizing = false;
                Util.event.off(document, 'mousemove', resizeMouseMove);
                Util.event.off(document, 'mouseup', resizeMouseUp);
            }
        }
    },

    // 收起 collapse
    collapse : function(toggle) {
        if(toggle === undefined){
            this.isCollapse = !this.isCollapse;
        }else{
            this.isCollapse = toggle;
        };

        if(this.isCollapse){
            this.beforeHeight = this.winElement.style.height;

            this.winElement.style.height = 
                (this.winElement.offsetHeight - this.winElement.clientHeight)
                + this.winHeader.offsetHeight + "px";
            this.winContent.style.display = "none";
            this.winFooter.style.display = "none";
        }else{
            this.winContent.style.display = "block";
            this.winFooter.style.display = "block";
            this.winElement.style.height = this.beforeHeight;
        }
    },

    // 最大化 maximize
    maximize : function(toggle) {
        if(toggle === undefined){
            this.isMaximize = !this.isMaximize
        }else{
            this.isMaximize = toggle;
        }

        if(this.isMaximize){
            var beforeStyle = this.winElement.style;
            this.beforeLeft = parseInt(beforeStyle.left, 10);
            this.beforeTop = parseInt(beforeStyle.top, 10);

            this.beforeWidth = parseInt(beforeStyle.width, 10);
            this.beforeHeight = (this.isCollapse && parseInt(this.beforeHeight,10)) || parseInt(beforeStyle.height, 10);
            this.resizeTo(this.winParent.clientWidth, this.winParent.clientHeight);
            this.moveTo(0, 0);
        }else{
            this.resizeTo(this.beforeWidth, this.beforeHeight);
            this.moveTo(this.beforeLeft, this.beforeTop);

            this.collapse(this.isCollapse);
        }
    },

    // 显示窗口
    show : function() {
        this.isShow = true;
        this.winElement.style.display = "block";
    },

    // 隐藏窗口
    hide : function() {
        this.isShow = false;
        this.winElement.style.display = "block";
    },

    // 切换显示和隐藏
    toggle : function() {
        this.isShow != this.isShow;
        this[(this.isShow ? "show" : "hide")]();
    },

    // 销毁窗口
    destory : function() {
        
    }

}

var win01 = new SimpleWindow({
    parent : Util.getId('wrapper'),

    width : 300,
    height : 300,
    top : 80,
    left : 100,

    minWidth : 10,
    minHeight : 10,

    title : "标题",
    content : "内容",
    footer : "状态栏"
});


var win02 = new SimpleWindow({
    parent : Util.getId('wrapper'),

    width : 200,
    height : 200,
    top : 250,
    left : 250,

    minWidth : 100,
    minHeight : 100,
    maxWidth : 300,
    maxHeight : 300,

    title : "标题",
    content : "内容",
    footer : "状态栏"
});

var win03 = new SimpleWindow({
    parent : Util.getId('wrapper'),

    width : 250,
    height : 200,
    top : 350,
    left : 350,

    minWidth : 100,
    minHeight : 100,
    maxWidth : 300,
    maxHeight : 300,

    title : "111",
    content : "222",
    footer : "3333"
});











