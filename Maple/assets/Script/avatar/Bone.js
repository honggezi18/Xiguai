/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 纸娃娃骨骼逻辑.
 * @end
 ******************************************/

var Bone = cc.Class({

    name : 'Bone',
    properties: {
        Name: "",
        Position: cc.p(0,0),
        Children: [],
        Skins: [],
        _parent : null,
        Parent: {
            get : function(){
                return this._parent;
            },
            set : function(value){
                if(this._parent == value) return;
                if(this._parent != null){
                    this._parent.RemoveChildByName(this.Name);
                }
                if(value != null){
                    value.Children.push(this);
                }
                this._parent = value;
            }
        }
    },

    FindChild : function(name){
        var children = this.Children;
        for(var i=0,len=children.length; i<len; i++){
            var bone = children[i];
            if(bone.Name == name) return bone;
            if(bone.Children.length > 0){
                var c = bone.FindChild(name);
                if(c) return c;
            }
        }
        return null;
    },

    RemoveChildByName : function(name){
        var children = this.Children;
        var newChildren = [];
        for(var i=0,len=children.length; i<len; i++){
            var bone = children[i];
            if(bone.Name != name)
                newChildren.push(bone);
        }
        this.Children = newChildren;
    },

	

});

module.exports = Bone;

