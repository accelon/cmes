import {fromObj,nodefs,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;

const Ingredient=readTextLines('off/6-ingredient.tsv');
const rawlines=readTextLines('off/3pujifang.off');
const Lexicon_ingredient={};
const formula_ingredient={};
const ingredient_formula={};
const build_ingredient_lemma_key=()=>{
    for (let i=1;i<Ingredient.length;i++) {//skip header
        const [key, alias]=Ingredient[i].split('\t');
        Lexicon_ingredient[key]=key;
        if (alias) {
            const lemmas=alias.split(',');
            for (let j=0;j<lemmas.length;j++) {
                Lexicon_ingredient[lemmas[j]]=key;
            }
        }
    }
}
build_ingredient_lemma_key();
// console.log(Lexicon_ingredient)

let correct=0,error=0;

const parseIngredient=(linetext, formula)=>{
    let text=linetext.replace(/（[^）]+）/g,'')
    .replace(/［[^］]+］/g,'').replace('^ingredient','').replace(/<[^>]+>/g,'')

    const ingredients=text.split(/[　 。]/).filter(it=>!!it);

    for (let i=0;i<ingredients.length;i++) {
        const ing=ingredients[i];
        const ingkey=Lexicon_ingredient[ing];
        if (ingkey) {
            if (!formula_ingredient[formula]) formula_ingredient[formula]=[];
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
            formula=parseInt(m[1])
        }
        const at=line.indexOf('^ingredient');
        if (!~at) continue;

        parseIngredient(line, formula);
    }
}

parse_formula();
console.log('correct',correct,'error',error, 'rate',(correct-error)/correct)

const gen_formula_ingredient=()=>{
    const arr=fromObj(formula_ingredient,(a,b)=>a+'\t'+b.join(','));

    arr.unshift('^:<name=formula preload=true caption=方到藥>	name:string alias:string');
    writeChanged('off/7-formula.tsv',arr.join('\n'),true);
  
}


const fill_ingredient_formula=()=>{
    const arr=fromObj(ingredient_formula,(a,b)=>a+'\t'+b.join(','));

    arr.unshift('^:<name=ingredient preload=true caption=藥到方>	name:string alias:string');
    writeChanged('off/8-ingredient.tsv',arr.join('\n'),true);
  
}

gen_formula_ingredient();
fill_ingredient_formula();