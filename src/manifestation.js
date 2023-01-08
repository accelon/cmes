/*
meridians 經
vessel 脈
https://www.ijopmed.org/cm-wm-terms.html
https://www.sohu.com/a/288411596_100020962
*/
export const tounge={
    /*brightness*/b:["淡","暗,黯"], 
    /*color*/c:["白","黃","紅,赤","紫,絳","青","黑,灰"], 
    /*location*/l:["尖,邊","中","根"], 
    /*thickness*/t:["薄","厚,胖,嫩"],
    /*pattern*/p:["清,無苔","垢","膩,黏","光,剝","裂,紋","斑","痕,印","刺","瘀"],
    /*humidity*/h:["乾,燥,糙,焦", "潤,滑,津"]
}
export const pulse={
    /*location*/l:["寸","關","尺"],
    /*thickness*/t:["細"],
    /*strength*/g:["軟","微,弱,無力","洪,有力","實,堅,大","虛"],
    /*frequency*/q:["數,疾,促,頻","緩,遲"],
    /*pressure*/p:["浮","沉,伏","按"],
    /*smoothness*/s:["滑","澀,澁"],
    /*waveform*/w:["弦","緊","結","代","濡"],
}

export const symtoms={
    /*body*/o:["身,體,肢","手,指,肘,腕","足,腳,脛,膝,腿,踁,踝","腹,肚,臍,脘","腰","背","胸,脅","肌,皮,膚",
        "骨,關節","筋","毛,髮","肛"],
    /*head*/h:["目,眼","頭","面,臉","頸,項","口,唇,舌","耳","鼻","喉,咽"],
    /*mental*/m:["精神,神","語,言"],
    /*sex*/x:["陽痿,陰痿,陽萎,陰萎"],
    /*viscera*/v:["心","肝","脾","肺","腎"],
    /*bowel*/b:["膽","小腸","胃","大腸","膀胱","三焦","腸"],
    /*excessive*/s:["熱,暑,燒","寒,冷","風","濕,溏","乾",],
    /*excretion*/e:["大便,屎,便,下利,洩","小便,尿,溺,溲","汗","嘔,吐","痰","膿","涎,沫","涕","淚","血","白帶"],
    /*unconfort*/u:["痛,疼","酸,痠","苦","腫","脹","悶","癢","麻,痺","攣,抽筋,抽搐","痞"],
    /*inactive*/i:["疲,倦,萎,靡,恍惚,不振","昏,眩","懶,怠,呆,癡","睡,寐,眠,睏,臥","夢"],
    /*aspiration*/a:["咳,喘","噯","噁","呼,吸"],
    /*nutrition*/n:["渴","飲","食"],
    /*feelings*/f:["畏","笑","惡","煩,躁","怒,狂","鬰","不樂","痵,怔,忡","譫"]
}

const splitFactors=(factors)=>{
    for (let key in factors){
        const arr=factors[key];
        for (let i=0;i<arr.length;i++) {
            if (~arr[i].indexOf(',')) {
                arr[i]=arr[i].split(',')
            }
        }
    }
}
splitFactors(tounge);
splitFactors(pulse);
splitFactors(symtoms);

export const Factors={
    tounge,
    pulse,
    symtoms
}