/**
 * Created by JetBrains WebStorm.
 * code by XyFreak and Secusion
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 23:44
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.SharestringConverter");

    qx.Class.define("bos.SharestringConverter", {
        type: "singleton",
        extend: qx.core.Object,
        statics: {
            fieldmask:"########################-------#-------#####--------#--------###---------#---------##---------#---------##------#######------##-----##-----##-----##----##-------##----##----#---------#----##----#---------#----#######----T----#######----#---------#----##----#---------#----##----##-------##----##-----##-----##-----##------#######--VV--##---------#----V--V-##---------#----V---V###--------#-----V-######-------#------V########################",
            fcp: new Array("B","A","C","D","2","3","5","O","J","4","K","N","1","L","M","E","P","S","Q","U","V","Y","Z","X","T","R","W","","0","F","G","H","I"),
            ncp: new Array(":",".",",",";","2","3","1","C","P","4","L","M","H","A","D","U","B","K","G","E","Y","V","S","X","R","J","Z","#","-","W","Q","I","F")

        },
        construct: function(inputstring) {
            raw = this._convert(inputstring);
        },
        members: {
            raw: null,
            _convert: function(inputstring) {
                var letter = inputstring[0];

                if (letter =="h") {
                    var tmp = inputstring.split("=");
                    var raw = tmp[1];

                    if (raw.length == 294){
                        return this.fcp2ncp(raw);
                    } else {
                        throw new Exception("Incorrect length of raw string " + raw.length);
                    }
                } else if (letter=="[") {
                    var pos = inputstring.indexOf("]");
                    var raw = inputstring.slice(pos + 1, pos + 443);
                    return this.ncp2fcp(raw);
                }

                throw new Exception("Incorrect sharestring format");
            },
            fcp2ncp: function(str) {

                var watercity;

                if (str.length != 294) {
                    throw new Exception("Incorrect sharestring length");
                }

                var out  = "[ShareString.1.3]";
                if (str[0] == 'W') {
                    out += ";";
                    watercity = true;
                } else if (str[0] == 'L') {
                    out += ":";
                    watercity = false;
                } else {
                    throw new Exception("Incorrect sharestring format");
                }

                var i,j, iswater = false;
                for (i = 0, j = 1; i < bos.SharestringConverter.fieldmask.length; i++ ) {
                    var mask = bos.SharestringConverter.fieldmask[i];
                    if (watercity && mask == 'V') {
                        iswater = !iswater;
                    }

                    if (mask == '#') {
                        out += "#";
                        iswater = false;
                    } else if (mask == 'T') {
                        j++;
                        out += "T";
                    } else if (watercity && str[j] == '0' && mask == 'V' ) {
                        j++;
                        out += '_';
                    } else if(watercity && iswater && str[j] == '0') {
                        j ++;
                        out += "#";
                    } else {
                        out += this._convertFCPtoNCPchar(str[j++]);
                    }
                }
                return out;
            },
            _convertFCPtoNCPchar: function(str) {
                for(var i = 0; i < fcp.length; i ++) {
                    if(fcp[i] == str) {
                        return ncp[i];
                    }
                }
                return "@";
            },
            ncp2fcp: function(rawstring){
                var watercity = false;
                var tempstring = "http://www.lou-fcp.co.uk/map.php?map=";
                for(var i = 1; i < 442; i++) {
                    if(i==1 && rawstring.charAt(0) == ";"){
                        tempstring = tempstring + "W";
                        watercity = true;
                    }
                    if(i==1 && rawstring.charAt(0)==":"){
                        tempstring=tempstring+"L";
                    }

                    if(i==221 && watercity){
                        tempstring+="0";
                        continue;
                    }
                    else if(i==353 && watercity){
                        tempstring+="0";
                        continue;
                    }
                    else if(i==354 && watercity){
                        tempstring+="0";
                        continue;
                    }
                    else if(i==374 && watercity){
                        tempstring+="0";
                        continue;
                    }
                    else if(i==375 && watercity){
                        tempstring+="0";
                        continue;
                    }
                    else if(i==376 && watercity){
                        tempstring+="0";
                        continue;
                    }
                    else if(i==396 && watercity){
                        tempstring+="0";
                        continue;
                    }
                    else if(i==397 && watercity){
                        tempstring+="0";
                        continue;
                    }
                    else if(rawstring[i]='T'){
                        tempstring+="0";
                        continue;
                    }
                    for(var a=0; a < ncp.length; a++){
                        if(rawstring[i] == ncp[a]) {
                            tempstring += fcp[a];
                        }
                    }

                }

                return tempstring;
            }
        }
    });
});