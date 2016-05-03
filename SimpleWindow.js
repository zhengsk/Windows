// 事件绑定
var Util = {
    
    event : {
        on: function(element, type, handler) {
            if(element.addEventListener) {
                element.addEventListener(type,handler,false);
            } else if (element.attachEvent) {
                element.attachEvent("on"+type,handler);
            } else {
                element["on"+type] = handler;
            }
        },

        off: function(element, type, handler) {
            if(element.removeEventListener) {
                element.removeEventListener(type,handler,false);
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
}


SimpleWindow.prototype = {

    // 创建窗口元素 并添加到页面
    _create : function(width, height) {
        var windowEle = this.windowEle = document.createElement('div');
        windowEle.className = "simple-window";
        windowEle.style.width = width + "px";
        windowEle.style.height = height + "px";

        var winContainer = this.winContainer = document.createElement('div');
        winContainer.className = "simple-window-container";
        windowEle.appendChild(winContainer);

        var winHeader = this.winHeader = document.createElement('div');
        winHeader.className = "simple-window-header";
        winContainer.appendChild(winHeader);

        var winContent = this.winContent = document.createElement('div');
        winContent.className = "simple-window-content";
        winContainer.appendChild(winContent);

        var winFooter = this.winFooter = document.createElement('div');
        winFooter.className = "simple-window-footer";
        winContainer.appendChild(winFooter);

        // 设置位置
        this.moveTo(this.options.top || 0, this.options.left || 0);

        // 添加到页面
        this.winParent.appendChild(windowEle);

        // 绑定拖动事件
        this._drag(windowEle, winHeader);

        // 绑定缩小放大事件
        this._bindResize();

    },

    // 移动窗口位置
    moveTo : function(top, left) {
        var winStyle = this.windowEle.style;
        winStyle.left = left + "px";
        winStyle.top = top + "px";
    },

    // 绑定拖动功能
    _drag : function(ele, handler) {

        var _self = this;

        // 鼠标起始位置
        var preAxis = {
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

            preAxis = Util.event.getPageAxis(event);

            prePosition = {
                top : ele.offsetTop,
                left : ele.offsetLeft
            }

            Util.event.on(document, 'mousemove', mouseMove);
            Util.event.on(document, 'mouseup', mouseUp);
        }

        // 拖动功能
        function mouseMove(event) {
            var currentAxis = Util.event.getPageAxis(event);
            var changedAxis = {
                x : currentAxis.x - preAxis.x,
                y : currentAxis.y - preAxis.y
            }

            var resultX = prePosition.left + changedAxis.x;
            var resultY = prePosition.top + changedAxis.y;

            // 超出范围判断
            resultX = resultX <= positionRange.minLeft ? positionRange.minLeft : resultX;
            resultX = resultX >= positionRange.maxLeft ? positionRange.maxLeft : resultX;

            resultY = resultY <= positionRange.minTop ? positionRange.minTop : resultY;
            resultY = resultY >= positionRange.maxTop ? positionRange.maxTop : resultY;


            _self.moveTo(resultY, resultX)
        }

        // 解绑拖动
        function mouseUp(evetn) {

            Util.event.off(document, 'mousemove', mouseMove);
            Util.event.off(document, 'mouseup', mouseUp);
        }

        Util.event.on(handler, 'mousedown', mouseDown);


        Util.event.on(ele, 'mousemove', function(e) {
            console.info(e.offsetX, e.offsetY)
        });
    },

    resizeTo : function(width, height) {
        var winStyle = this.windowEle.style;
        winStyle.width = width + "px";
        winStyle.height = height + "px";
    },

    _bindResize : function() {
        // body...
    }




}

var win01 = new SimpleWindow({
    parent : Util.getId('wrapper'),

    width : 300,
    height : 300,
    top : 80,
    left : 100,

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

    title : "标题",
    content : "内容",
    footer : "状态栏"
});










