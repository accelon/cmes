import {unique,alphabetically,Offtext,cjkPhrases,removeBracket,alphabetically0, fromObj,nodefs,parseOfftext,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;
import {SickCauses,SickLocations,SickSigns} from './src/code.js'
import { Factors } from './src/manifestation.js';
const needtag={

ill:1,
norm:2,western:2,chinese:2,
symtoms:2,pulse:2,tounge:2,combo:2,ingredients:2,
formula:3, origin:3,alias:3
}

let tid='';
const rawtext=readTextLines('./zyzhx-raw.off');


//按照原書的順序，箤取需要的 tag
const diseasename=tid=>{ //證候名
    return tid.replace(/l(\d+)z(\d+)h(\d+)/,(m,l,z,h)=>{
        return '【'+SickCauses['l'+l]+SickLocations['z'+z]+'證.'+SickSigns['h'+h]+'候】'
        +'^sickloc'+z+'^sickcause'+l+ '^sick'+l+'z'+z+'^sign'+h;
    })
}
const extractneedtag=()=>{
    const out=[];
    for (let i=0;i<rawtext.length;i++) {
        const line=rawtext[i];
        if (line.slice(0,3)=='^ck') {
            tid='l'+line.slice(3,12);
            out.push('^ck'+line.slice(3,12)+diseasename(tid))
            continue;
        }
        line.replace(/\^([a-z]+)(\d*)([^\^]+)/g,(m,tag,n,content)=>{
            if (needtag[tag]) out.push('^'+tag+n+content);
        })
    }
    return out;
}

const TagStat={};
const illness={};
const addPhrases=(t, Obj)=>{
    const words=cjkPhrases(t);
    for (let i=0;i<words.length;i++) {
        const w=words[i];
        if (!Obj[w]) Obj[w]=0;
        Obj[w]++;
    }
}
const addIllness=(t,Obj)=>{
    if (!Obj[t]) Obj[t]=0;
    Obj[t]++;
}

const parseField=lines=>{
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        const ot=new Offtext(line);
        for (let j=0;j<ot.tags.length;j++) {
            const tag=ot.tags[j];
            const tagtype=needtag[tag.name];
            if (tagtype==1) {
                const t=removeBracket(ot.tagText(j).trim());
                if (!t) console.log('error empty illness',i+1,line)
                addIllness(t, illness);
            } else if (tagtype==2) {
                if (!TagStat[tag.name]) TagStat[tag.name]={};
                addPhrases(ot.plain.slice(tag.offset).trim(),TagStat[tag.name]);
            } else if (tagtype==3) {
                const t=removeBracket(ot.tagText(j).trim());
                if (!TagStat[tag.name]) TagStat[tag.name]={};
                addIllness(t, TagStat[tag.name]);
            }
        }
    }
}


const rawfields=extractneedtag();
rawfields.unshift('^ak1【證候】^bk1【證候】');
writeChanged('off/zyzhx.off',rawfields.join('\n'),true);

parseField(rawfields);

writeChanged('zyzhx-illness.txt',fromObj(illness,true).join('\n'),true);
for (let key in TagStat) {
    writeChanged('zyzhx-'+key+'.txt', fromObj(TagStat[key],true).join('\n'),true);
}

export const scanFactor=(name,items,keyfactors)=>{
    const out={} , notfound=[] , inverted={};
    for (let i=0;i<items.length;i++) {
        const item=items[i];
        if (!item) continue;
        const traits=[];
        let factorcount=0;
        for (let key in keyfactors) {
            const factors=keyfactors[key];
            for (let j=0;j<factors.length;j++) {
                const factor=factors[j];
                if (typeof factor=='string') {
                    if (~item.indexOf(factor)) {
                        if (!~traits.indexOf(key+j)) traits.push(key+j);
                        if (!inverted[key+j]) inverted[key+j]
                        factorcount++;
                    }
                } else {
                    for (let k=0;k<factors[j].length;k++) {
                        const factor=factors[j][k];
                        if (~item.indexOf(factor)) {
                            if (!~traits.indexOf(key+j)) traits.push(key+j);
                            factorcount++;
                        } 
                    }
                }
            }
        }
        if (factorcount) out[item]=traits.sort().join('')
        else notfound.push(item);

    }
    writeChanged('zyzhx-factor-'+name+'.txt',fromObj(out,true).join('\n'),true)
    return [out,notfound];
}

const factorCodes={};
export const extractFactors=(TagStat)=>{
    for (let key in TagStat) {
        const Factor=Factors[key];
        if (!Factor) continue;
        const arr=fromObj(TagStat[key],true).filter(it=>it[1]>1).map(it=>it[0]);
        const [out,notfound]=scanFactor(key,arr , Factor); 
        factorCodes[key]=out;
    }
}

extractFactors(TagStat);

const encodeField=(words,codes)=>{
    let out='';
    for (let i=0;i<words.length;i++) {
        const w=words[i];
        if (codes[w]) out+=codes[w];
    }
    const arr=out.split(/(..)/).filter(it=>!!it)
    
    return unique(arr).sort(alphabetically);
}
export const encodeLines=rawfields=>{
    let codes='',illline=0,ck, manifestcount=0,formulas=[];
    const out=[];
    for (let i=0;i<rawfields.length;i++) {
        const line=rawfields[i];
        const tag=line.slice(1,6);
        
        if (tag.slice(0,2)=='ck') {
            out.push(ck+formulas.join('\t'))
            ck='L'+line.slice(3);
            manifestcount=0;
            formulas=[];           
        } else if (tag.slice(0,3)=='ill') {
            if (codes) {
                out.push( ck+'-'+(++manifestcount)+':'+codes);
                codes='';
            }
            illline=i;
        } else if (tag=='symto') {
            const words=cjkPhrases(line.slice(8));
            codes+='$'+encodeField(words, factorCodes.symtoms).join('');
        } else if (tag=='toung') {
            const words=cjkPhrases(line.slice(8));
            codes+='@'+encodeField(words, factorCodes.tounge).join('');
        } else if (tag=='pulse') {
            const words=cjkPhrases(line.slice(6));
            codes+='%'+encodeField(words, factorCodes.pulse).join('');
        } else if (tag=='formu') {
            line.replace(/〔(.+?)〕/,(m,m1)=>{
                formulas.push(m1)
            })
        }
    }
    writeChanged('zyzhx-ill-manifestation.txt',out.join('\n'),true);
}


encodeLines(rawfields);


const scoreMedicine=(line, medicines)=>{
    const words=cjkPhrases(line);
    let count=0;
    for (let i=0;i<words.length;i++) {
        if (medicines[words[i]] ) count++;
    }
    return count/words.length;
}
const tagIngredient=(lines)=>{
    const medicines={};
    let autotagcount=0;
    const out=[];
    const arr=readTextLines('off/2-medicine.tsv').map(line=>{
        return line.split('\t')[0]
    })
    for (let i=0;i<arr.length;i++) {
        medicines[arr[i]]=true;
    }
    for (let i=0;i<lines.length;i++) {
        let line=lines[i];
        if (line.charAt(0)!=='^') {
            const score=scoreMedicine(line, medicines);
            if (score>0.3) {
                line='^ingredients0 '+line;
                autotagcount++;
            }  
        }
        out.push(line)
    }
    if(autotagcount) {
        // numbering ingredients
        let count=0;
        for (let i=0;i<out.length;i++) {
            if (out[i].slice(0,12)=='^ingredients') {
                out[i]=out[i].replace(/^\^ingredients\d*/,()=>{
                    return '^ingredients'+ (++count);
                })
            }
        }
        console.log('new ingredient tag',autotagcount,'all ingredients',count);
        writeChanged('zyzhx-autotag.off',out.join('\n'),true)
    }
}




tagIngredient(rawtext);