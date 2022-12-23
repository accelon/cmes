import {alphabetically0, fromObj,nodefs,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;

const Ingredient=readTextLines('off/2-ingredient.tsv');
const rawlines=readTextLines('off/0pujifang.off');
const Lexicon_ingredient={};
const formula_ingredient={};
const ingredient_formula={};
const build_ingredient_lemma_key=()=>{
    for (let i=1;i<Ingredient.length;i++) {//skip header
        const [key,master]=Ingredient[i].split('\t');
        Lexicon_ingredient[key]=master||'';
    }
}

build_ingredient_lemma_key();

let correct=0,error=0;

const parseIngredient=(linetext, formula)=>{
    let text=linetext.replace(/（[^）]+）/g,'')
    .replace(/［[^］]+］/g,'').replace('^ingredient','').replace(/<[^>]+>/g,'')

    const ingredients=text.split(/[　 。]/).filter(it=>!!it);

    for (let i=0;i<ingredients.length;i++) {
        const ing=ingredients[i];
        let   ingkey=Lexicon_ingredient[ing] ;
        if (Lexicon_ingredient.hasOwnProperty(ing) && !ingkey) ingkey=ing;
        if (ingkey) {
            
            if (!~formula_ingredient[formula].indexOf(ingkey)){
                formula_ingredient[formula].push(ingkey);
            }

            if (!ingredient_formula[ingkey]) ingredient_formula[ingkey] = [];

            if (!~ingredient_formula[ingkey].indexOf(formula)){
                ingredient_formula[ingkey].push(formula);
            }

                
            correct++;
        } else {    
            error++
            // console.log(formula,ing)
        }
    }
}
const parse_formula=()=>{
    let formula=0;
    for (let i=0;i<rawlines.length;i++) {
        const line=rawlines[i];
        const m=line.match(/formula(\d+)/);
        if (m) {
            formula=parseInt(m[1]);
            if (!formula_ingredient[formula]) formula_ingredient[formula]=[];
            else {
                console.log('repeated formula',m[1])
            }
        }

        const at=line.indexOf('^ingredient');
        if (!~at) continue;

        formula&&parseIngredient(line, formula);
    }
}

parse_formula();
console.log('correct',correct,'error',error, 'rate',(correct-error)/correct)

const gen_formula_ingredient=()=>{
    const arr=fromObj(formula_ingredient,(a,b)=>b.join(','));
//serial is one-base
    arr.unshift('^:<name=formula keytype=serial preload=true caption=方劑>ingredients=keys:ingredient');
    writeChanged('off/7-formula.tsv',arr.join('\n'),true);
}


const fill_ingredient_formula=()=>{
    const arr=fromObj(ingredient_formula,(a,b)=>a+'\t'+b.join(','));
    arr.sort(alphabetically0);
    arr.unshift('^:<name=ingredient2formula preload=true caption=藥到方>name:string\tformulas=numbers');
    writeChanged('off/8-ingredient.tsv',arr.join('\n'),true);
  
}

gen_formula_ingredient();
fill_ingredient_formula();