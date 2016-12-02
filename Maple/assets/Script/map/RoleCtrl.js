/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 玩家控制.
 * @end
 ******************************************/

cc.Class({
    extends: cc.Component,

    properties: {
        upBtn : cc.Node,
        leftBtn : cc.Node,
        downBtn : cc.Node,
        rightBtn : cc.Node,
        label : cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.role = null;
        this.dir = null;
        this.rolePosInfoNode = cc.find("Canvas/MainUI/topUILayer/topInfo/rolePos");


    },

    setRole : function(role){
        this.role = role;
        this.dir = null;
    },

    setRoleUp : function(){
        this.role.changeAction("ladder");
        this.dir = this.dir == "up" ? null : "up";
    },
    setRoleLeft : function(){
        this.dir = this.dir == "left" ? null : "left";
        if(this.dir == null){
            this.role.playStand();
        }else{
            this.role.playWalk();
        }
    },
    setRoleDown : function(){
        this.role.changeAction("rope");
        this.dir = this.dir == "down" ? null : "down";
    },
    setRoleRight : function(){
        this.dir = this.dir == "right" ? null : "right";
        if(this.dir == null){
            this.role.playStand();
        }else{
            this.role.playWalk();
        }
    },

    roleJump : function(){
        this.dir = null;
        
        let editboxNode = cc.find("Canvas/MainUI/bottomUILayer/jumEdit");
        let argListStr = editboxNode.getComponent(cc.EditBox).string;
        let argList = argListStr.split(',');
        let offsetX = parseInt(argList[0]);
        let offsetY = parseInt(argList[1]);
        

        let role = this.role;
        let fromPos = this.role.position;
        let toPos = cc.pAdd(fromPos, cc.p(offsetX, offsetY));
        let parabolaMovaAction = new ParabolaMove(fromPos, toPos);

        role.changeAction("jump");
        let seq = cc.sequence(parabolaMovaAction, cc.callFunc(function(){role.changeAction("alert")}));
        role.runAction(seq);

       

        
        // if(this.role.scaleX>0){
        //     offsetX = -offsetX;
        // }
        // let toPos = cc.pAdd(nowPos, cc.p(offsetX, offsetY));
        // let actionTo = cc.jumpTo(time, toPos, height, num);
        // actionTo.easing(cc.easeOut(3.0));
        // this.role.runAction(actionTo);



    },


    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(!this.time||this.time > 1){
            let frame = Math.floor(1/dt);
            this.label.getComponent(cc.Label).string = frame;
            this.time = 0
        }
        this.time += dt;
        
        if(this.role){
            switch(this.dir){
                case "up" : 
                    this.role.y += 2;
                    break;
                case "left" :
                    this.role.x -= 2;
                    this.role.scaleX = 1;
                    break;
                case "down" :
                    this.role.y -= 2;
                    break;
                case "right" : 
                    this.role.x += 2;
                    this.role.scaleX = -1;
                    break;
                default : 
                    break;
            }
            this.rolePosInfoNode.getComponent(cc.Label).string = `role: (${this.role.x},${this.role.y})`;
        }

        
        
    },
});
