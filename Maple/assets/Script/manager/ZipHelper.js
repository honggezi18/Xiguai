/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc zip包下载管理.
 * @end
 ******************************************/

const JSZip = require("../common/jszip.min.js");
const JSZipUtils = require("../common/jszip-utils.min.js");

var ZipHelper = cc.Class({
  
    start : function(node){
 
        JSZipUtils.getBinaryContent("res/raw-assets/resources/Config.zip", function(err, data) {
            if(err){
                throw "JSZip Error : " + err;
            }

            // JSZip.load(data)
            JSZip.loadAsync(data)
            .then(function(zip){
                let list = [];
                zip.folder("Config").forEach(function(relativePath, file){
                    if(file.dir == false){
                        list.push({path:relativePath, file:file});
                    }
                });
                let length = list.length;
                node.emit("load_zip_end", length);
                for(let i=0,len=list.length; i<len; i++){
                    let path = list[i].path;
                    let file = list[i].file;
                    let pathItemList = path.split("/");
                    if(pathItemList[0] == "Map"){
                        let Model = pathItemList[1];
                        let FileName = pathItemList[2].substring(0,pathItemList[2].length-3);
                        file.async("string").then(function success(text){
                            let c = eval(text);
                            if(!window[Model])
                                window[Model] = {};
                            window[Model][FileName] = c;
                            node.emit("add_zip", 1);
                        });
                    }else if(pathItemList[0] == "Avatar"){
                        let Model = "AvatarConfig";
                        let FileName = pathItemList[1].substring(0,pathItemList[1].length-3);
                        file.async("string").then(function success(text){
                            let c = eval(text);
                            if(!window[Model])
                                window[Model] = {};
                            window[Model][FileName] = c;
                            node.emit("add_zip", 1);
                        });
                    }else if(pathItemList[0] == "Mob"){
                        let Model = "MobConfig";
                        let FileName = pathItemList[1].substring(0,pathItemList[1].length-3);
                        file.async("string").then(function success(text){
                            let c = eval(text);
                            if(!window[Model])
                                window[Model] = {};
                            window[Model][FileName] = c;
                            node.emit("add_zip", 1);
                        });
                    }else if(pathItemList[0] == "Skill"){
                        let Model = "SkillConfig";
                        let FileName = pathItemList[1].substring(0,pathItemList[1].length-3);
                        file.async("string").then(function success(text){
                            let c = eval(text);
                            if(!window[Model])
                                window[Model] = {};
                            window[Model][FileName] = c;
                            node.emit("add_zip", 1);
                        });
                    }else{
                        node.emit("add_zip", 1);
                    }

                }
            
            })
            
        });

    },

});

module.exports = ZipHelper;