import {unique,alphabetically,Offtext,cjkPhrases,removeBracket,alphabetically0, fromObj,nodefs,parseOfftext,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;
import {meta_cm} from 'ptk/nodebundle.cjs'
const rawlines=readTextLines('off/2shx.off');
const {SickFactors,encodeFactor,encodeFactors} = meta_cm;
export const encodeLines=lines=>{
    const out=[];
    
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        const tag=line.slice(1,9); 
        let toungecodes='',symtomcodes='',pulsecodes='';
        if (tag=='diagnose') {
            const words=cjkPhrases(line.slice(10));
            symtomcodes+=encodeFactors(words, 'symtom').join('');
            toungecodes+=encodeFactors(words, 'tounge').join('');
            pulsecodes+=encodeFactors(words, 'pulse').join('');
            out.push( symtomcodes+'\t'+toungecodes+'\t'+pulsecodes);
        }
    }
    out.unshift('^:<name=manifest caption=症象 master=diagnose keytype=serial preload=true>symtom\ttounge\tpulse');
    writeChanged('off/2-manifest.tsv',out.join('\n'),true);
}

encodeLines(rawlines);