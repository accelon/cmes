import {alphabetically0, fromObj,nodefs,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;

const lines=readTextLines('中醫癥狀鑒別診斷學.off')
const out=[];
let i=0,group=0;
const groups={
    1:'溫', 13:'汗', 24:'身',  44:'情', 64:'睡', 76:'頭', 92:'面',
    103:'口',    122:'舌', 148:'苔', 154:'牙', 162:'肢', 190:'背',
    202:'息', 225:'肚' , 247:'屎',256:'尿', 270:'男',285:'經',
    328:'妊', 358:'產', 377:'婦', 392:'兒',
    458:'外',485:'肛', 499:'皮', 547:'耳', 553:'鼻',564:'喉',572:'目'
}
const groupsremove={
    '皮':'皮膚',
    '肛':'肛門',
    '妊':'妊娠',
    '經':'經行',
    '產':'產后',
    '苔':'舌苔',
    '肢':'四肢',
    '兒':'小兒',
    '尿':'小便',
    '屎':'大便',
}
//小兒, 肛門, 皮膚 產后, 妊娠 , 經行
while (i<lines.length) {
    let line=lines[i];
    let ck=0,caption='',def;
    let m=line.match(/\^ck(\d+)[｛【](.+?)[｝】]/);
    if (m) {
        ck=parseInt(m[1]);
        group=groups[ck] || group;
        const remove=groupsremove[group];
        caption=m[2].replace(remove,'');
        i+=2;
        def= lines[i];
        if (def.indexOf('^def')==-1) {
            console.log('no def ', ck,caption)
        } else {
            def=def.replace('^def','')
        }
        

        def=def.replace(caption+'，','');
        def=def.replace(caption,'');
        def=def.replace(/^[：\.]/,'');
        def=def.replace(/\^s[\(](.+?)[\)”。]/g,"$1");
        const syn=[];
        while (i<lines.length) {
            if (lines[i].indexOf('^s')) {
                lines[i].replace(/\^s[\(](.+?)[\)”。]/g,(m,m1)=>{
                    syn.push(m1)
                })
            }
            if (lines[i].indexOf('^ck')>-1) break;
            i++;
        }
        out.push(ck.toString().padStart(3,'0')+'\t'+group+'\t'+caption+'\t'+syn.join(',')+'\t'+def);

    } else i++;
}
out.unshift('^:<name=symtom preload=true caption=病況>\tgroup=string\tcaption=string\talias=string\tdef=string');
writeChanged('off/1-symtom.tsv',out.join('\n'),true)