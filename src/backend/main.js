import {stringSimilarity} from 'string-similarity-js'
import dataFile from '../../VShuttle-input.json' with {type: "json"}

function isDay(daystring, today) {
    return (daystring == today.replaceAll("ì", "i").toUpperCase())
}

function isInTimeframe(timestring, thistime) {
    let e = new RegExp("[0-9].*[-]{1}.*[0-9]")
    if (e.test(timestring)) {
        let spl = e.exec(timestring)[0].split("-")
        let firstHour, lastHour
        if (spl[0].includes(":")) {
            firstHour = Number(spl[0].replaceAll(":", "."))
        }
        else {
            firstHour = Number(spl[0])
        }
        if (spl[1].includes(":")) {
            lastHour = Number(spl[1].replaceAll(":", "."))
        }
        else {
            lastHour = Number(spl[1])
        }
        
        let thisHour = Number(thistime.replaceAll(":", "."))
        
        console.log(firstHour, lastHour, thisHour)
        return (thisHour >= firstHour && thisHour <= lastHour)
    } else {
        throw new Error("No time detected")
    }
}

function handleData(data) {
    // data: un singolo elemento dell'array
    // restituisce STOP, GO o HUMAN
    let frontale = data["sensori"]["camera_frontale"]
    let coeff_frontale = 1
    let laterale = data["sensori"]["camera_laterale"]
    let coeff_laterale = 0.85
    let rec = data["sensori"]["V2I_receiver"]
    let coeff_rec = 0.75
    let result;     // stringa interpretata
    if (!(frontale["confidenza"] >= 0.6 || laterale["confidenza"] >= 0.8 || rec["confidenza"] >= 0.9)) {
        return "HUMAN"
    }
    if (frontale["testo"] == laterale["testo"] == rec["testo"]) {
        result = frontale["testo"]
    }
    else {
        // Come interpretare result
        let peso_frontale = frontale["confidenza"]*coeff_frontale
        let peso_laterale = laterale["confidenza"]*coeff_laterale
        let peso_rec = rec["confidenza"]*coeff_rec
        let testi_pesi = [[frontale["testo"], peso_frontale], [laterale["testo"], peso_laterale], [rec["testo"], peso_rec]]
        let tp_finali = []
        for (let c of testi_pesi) {
            if (typeof c[1] == "number" && c[1] >= 0.6) {tp_finali.push(c)}
        }
        if (tp_finali.length == 0) {return "HUMAN"}
        if (tp_finali.length == 1) {result = tp_finali[0][0]}
        else {
            tp_finali.sort((a, b) => b[1] - a[1])
            if (stringSimilarity(tp_finali[0][0].replaceAll(" ", ""), tp_finali[1][0].replaceAll(" ", "")) > 0.7) {
                result = tp_finali[0][0]
            }
        }
    }
    // Rende sano il result
    if (!result) {
        return "HUMAN"
    }
    let numeric = new RegExp("[a-zA-Z][0-9]+[a-zA-Z]")
    while (numeric.test(result)) {
        // Finché c'è un'espressione del genere
        result = result.replaceAll(numeric.exec(result)[0])
    }

    // Determinare l'azione da compiere
    if (result.replaceAll(" ", "").includes("DALLE")) {
        let e = new RegExp("ALLE.*[0-9]")
        result = result.replaceAll("ALLE", "-")
        if (!(e.test(result))) {
            result = result + "-24:00"
        }
    }

    if (result.replaceAll(" ", "").includes("ZTL")) {
        if (result.replaceAll(" ", "").includes("NONATTIV")) {
            return "GO"
        }
        try {
            if (isInTimeframe(result, data["orario_rilevamento"])) return "STOP"
            else return "GO"
        } catch (e) {return "STOP"}
    }
    if (result.replaceAll(" ", "").includes("ECCETTO") && result.replaceAll(" ", "").includes("BUS")) {
        return "GO"
    }
    if (result.replaceAll(" ", "").includes("DIVIETO")) {
        // Arrivando qui si sa già che non c'è un "ECCETTO BUS"
        try {
            if (isInTimeframe(result, data["orario_rilevamento"])) {
                return "STOP"
            }
            else {
                return "GO"
            }
        } catch (e) {return "STOP"}
    }
    if (result.replaceAll(" ", "").includes("PIAZZA")) {
        return "GO"
    }
    if (result.replaceAll(" ", "").includes("MERCATO")) {
        let ex = new RegExp("LUNEDI|MARTEDI|MERCOLEDI|GIOVEDI|VENERDI|SABATO|DOMENICA")
        if (ex.test(
            result.replaceAll(" ", "")
        )) {
            if (isDay(ex.exec(result.replaceAll(" ", "")), data["giorno_settimana"])) {
                try {
                    if (isInTimeframe(result, data["orario_rilevamento"])) {
                        return "STOP"
                    }
                    else return "GO"
                } catch (e) {
                    return "STOP"
                }
            }
        }
    }
    if (result.replaceAll(" ", "").includes("ATTENZIONE")) {
        return "GO"
    }
    
    //if (result.)
    return "HUMAN"
}  


// possibili stringhe
// let ps = []
// for (let d of dataFile) {
//     if (!(ps.includes(d["sensori"]["camera_frontale"]))) {
//         ps.push(d["sensori"]["camera_frontale"])
//     }
// }
// // console.log(ps)
for (let o of dataFile) {
    console.log(o["sensori"])
    console.log(handleData(o))
    console.log("=============================0")
}