import {fromObj,nodefs,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;
const Lexicon_ingredient={};
const Ingredient=readTextLines('6-ingredient-old.tsv');
const build_ingredient_lemma_key=()=>{
    for (let i=1;i<Ingredient.length;i++) {//skip header
        const [key, alias]=Ingredient[i].split('\t');
        Lexicon_ingredient[key]=key;
        if (alias) {
            const lemmas=alias.split(',');
            for (let j=0;j<lemmas.length;j++) {
                if (key.length>lemmas[j].length) console.log(lemmas[j])
                Lexicon_ingredient[lemmas[j]]=key;
            }
        }
    }
}
build_ingredient_lemma_key();
const arr=fromObj(Lexicon_ingredient, (a,b)=> a==b?a:a+'\t'+b);

arr.unshift('^:<name=ingredient preload=true caption=藥名>	name:string master:key');

writeChanged('off/6-ingredient.tsv',arr.join('\n'),true);