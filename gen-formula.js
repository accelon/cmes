import {alphabetically0, fromObj,nodefs,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;
//藥 medicine ，又名
//ingredients ，配方，藥名清單
//ingredient  ，藥可組成的配方清單

const Ingredient=readTextLines('off/2-medicine.tsv');
const rawlines=readTextLines('off/0pujifang.off');
const Lexicon_ingredient={};
const ingredients=[];
const ingredient_members={};
const build_ingredient_lemma_key=()=>{
    for (let i=1;i<Ingredient.length;i++) {//skip header
        const [key,master]=Ingredient[i].split('\t');
        Lexicon_ingredient[key]=master||'';
    }
}

build_ingredient_lemma_key();

let correct=0,error=0;

const parseIngredient=(linetext, seq,line)=>{
    let text=linetext.replace(/（[^）]+）/g,' ').replace(/、/g,' ')
    .replace(/［[^］]+］/g,'').replace(/\^ingredients[\d+ ]*/,'').replace(/<[^>]+>/g,'')
    const members=text.split(/[　 。]/).filter(it=>!!it);
    ingredients[seq]=[];
    for (let i=0;i<members.length;i++) {
        let mem=members[i]; //一味藥
        let norm=Lexicon_ingredient[mem] ||mem; 
        // if (norm!==mem)console.log(mem,norm,line)

        if (Lexicon_ingredient.hasOwnProperty(mem)) {
            ingredients[seq].push(norm); //用正規名
            correct++;

            if (!ingredient_members[norm])ingredient_members[norm]=[];
            ingredient_members[norm].push(seq)
        } else {    
            error++
            if (mem.length>8) console.log(seq+1,mem)
        }


    }
    ingredients[seq].sort();
}
const parse_formula=()=>{
    for (let i=0;i<rawlines.length;i++) {
        const line=rawlines[i];
        const m=line.match(/ingredients(\d+)/);
        if (!m) continue;
       
        parseIngredient(line, parseInt(m[1])-1, i);
    }
}

parse_formula();
console.log('correct',correct,'error',error, 'rate',(correct-error)/correct)

const gen_formula_ingredient=()=>{
    //serial is one-base
    ingredients.unshift('^:<name=ingredients keytype=serial preload=true caption=配方之藥>member=keys:ingredient');
    writeChanged('off/7-ingredients.tsv',ingredients.join('\n'),true);
}


const fill_ingredient_formula=()=>{
    const arr=fromObj(ingredient_members,(a,b)=>a+'\t'+b.join(','));
    arr.sort(alphabetically0);
    arr.unshift('^:<name=ingredient preload=true caption=藥之配方>name:string\tmember=numbers:ingredients');
    writeChanged('off/8-ingredient.tsv',arr.join('\n'),true);
  
}

gen_formula_ingredient(); //方 - 藥名清單
fill_ingredient_formula(); //藥- 含此藥之方