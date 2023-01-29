/* auto tag symtom and ingredients */
import {meta_cm,cjkPhrases, fromObj,nodefs,readTextLines, writeChanged, openPtk} from 'ptk/nodebundle.cjs'
await nodefs;
const {encodeFactors,similarFactors} =meta_cm;
const lines=readTextLines('yian-qgmyyalb.off');

const tagSymtom=async ()=>{
    const ptk=await openPtk('cm');
    for (let idx=0;idx<lines.length;idx++) {
        const line=lines[idx];
        if (line.slice(0,7)=='^symtom') {
            const words=cjkPhrases(line.slice(8));
            const factors=encodeFactors(words,'symtom');
            const sim=similarFactors(ptk,'symtom',factors);
            if (sim.length>0) {
                await ptk.loadLines([sim[0].line]);
                const ptkline=ptk.getLine(sim[0].line)
                if (sim[0].similarity>=0.9 && factors.length>=4) {
                    console.log('\n全國醫案：',idx,line, '\n中醫證候學',sim[0].similarity,ptkline,factors)
                }
            }
        }
    }
}

tagSymtom();