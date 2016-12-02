/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 抛物线运动逻辑.
 * @end
 ******************************************/

// var ParabolaMove = cc.Class({ // JSB
//     extends : cc.ActionInterval,

var ParabolaMove = cc.ActionInterval.extend({

    _positionDelta:null,
    _startPosition:null,
    _previousPosition:null,

    ctor:function (startPos, endPos) {
        cc.ActionInterval.prototype.ctor.call(this);

        // 重力加速度
        this._m_g =  1000; 
        // xy偏移
        var x1 = endPos.x - startPos.x;
        var y1 = endPos.y - startPos.y;
        // y轴初速度
        var vy0 = 400;
        if(y1 < 0){ // 如果向下则初速度为0
            vy0 = 0;
        }
        // 计算达到y轴所用的时间
        var a = this._m_g;
        var b = -2*vy0;
        var c = 2*y1;
        if(b*b/(4*a) < c){ // 最高跳80
            // c = b*b/(4*a);
            return false;
        }
        var duration = (Math.sqrt(b*b-4*a*c)-b)/(2*a);
        // 计算x轴速度
        var vx0 = x1 / duration; 
        this.initWithDuration(duration, vx0, vy0);        
    },

    /*
     * Initializes the action.
     * @param {Number} duration duration in seconds
     * @param {Vec2} position
     * @param {Number} [y]
     * @return {Boolean}
     */
    initWithDuration:function (duration, vx0, vy0) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
	        this._m_vx0 = vx0;
            this._m_vy0 = vy0;
            this._m_duration = duration;
            return true;
        }
        return false;
    },

    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        var locPosX = target.getPositionX();
        var locPosY = target.getPositionY();
        this._startPosition = cc.p(locPosX, locPosY);
    },

    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this.target) {
            var elapsed = dt * this._m_duration;
            var diff_x = this._m_vx0 * elapsed;
            var diff_y = this._m_vy0 * elapsed -0.5*this._m_g * elapsed * elapsed;
            var newPos = cc.pAdd(this._startPosition, cc.p(diff_x, diff_y));
            this.target.setPosition(newPos);
            
        }
    }

});



