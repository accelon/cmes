import {unique,alphabetically,Offtext,cjkPhrases,removeBracket,alphabetically0, fromObj,nodefs,parseOfftext,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;

const rawtext=readTextLines('./zyzhx-raw.off');

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
    } else {
        console.log('unable to tag ingredients')
    }
}
const scoreMedicine=(line, medicines)=>{
    const words=cjkPhrases(line);
    let count=0;
    for (let i=0;i<words.length;i++) {
        if (medicines[words[i]] ) count++;
    }
    return count/words.length;
}

tagIngredient(rawtext);