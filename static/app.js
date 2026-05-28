// =====================================================
// RCA ENGINE
// =====================================================

function renderRCA(data){

    const area =
        document.getElementById(
            "rcaList"
        );

    area.innerHTML = "";

    for(const p in data){

        const row =
            document.createElement("div");

        row.className =
            "d-flex gap-2 mt-2";

        const btn =
            document.createElement("button");

        btn.className =
            "btn btn-secondary flex-grow-1";

        btn.innerHTML =
            `${p} → ${data[p].cause_parameter || ""}`;

        btn.onclick = () => {

            loadRCAData(p);
        };

        row.appendChild(btn);

        area.appendChild(row);
    }
}

// =====================================================
// LOAD RCA DATA
// =====================================================

function loadRCAData(parameter){

    const data =
        rcaDatabase[parameter];

    if(!data)
        return;

    document.getElementById(
        "rcaParam"
    ).value =
        parameter || "";

    document.getElementById(
        "causeParameter"
    ).value =
        data.cause_parameter || "";

    document.getElementById(
        "designValue"
    ).value =
        data.design || "";

    document.getElementById(
        "causeText"
    ).value =
        data.cause || "";

    document.getElementById(
        "highReasons"
    ).value =
        data.high || "";

    document.getElementById(
        "lowReasons"
    ).value =
        data.low || "";
}

// =====================================================
// PARAMETER → CAUSE PARAMETER
// =====================================================

function rcaParameterChanged(){

    const param =
        document.getElementById(
            "rcaParam"
        ).value.trim();

    if(!param)
        return;

    const data =
        rcaDatabase[param];

    if(!data)
        return;

    document.getElementById(
        "causeParameter"
    ).value =
        data.cause_parameter || "";

    document.getElementById(
        "designValue"
    ).value =
        data.design || "";

    document.getElementById(
        "causeText"
    ).value =
        data.cause || "";

    document.getElementById(
        "highReasons"
    ).value =
        data.high || "";

    document.getElementById(
        "lowReasons"
    ).value =
        data.low || "";
}

// =====================================================
// CAUSE PARAMETER → PARAMETER
// =====================================================

function causeParameterChanged(){

    const causeParam =
        document.getElementById(
            "causeParameter"
        ).value.trim();

    if(!causeParam)
        return;

    for(const p in rcaDatabase){

        const item =
            rcaDatabase[p];

        if(
            item.cause_parameter &&
            item.cause_parameter.toLowerCase()
            ===
            causeParam.toLowerCase()
        ){

            document.getElementById(
                "rcaParam"
            ).value = p;

            document.getElementById(
                "designValue"
            ).value =
                item.design || "";

            document.getElementById(
                "causeText"
            ).value =
                item.cause || "";

            document.getElementById(
                "highReasons"
            ).value =
                item.high || "";

            document.getElementById(
                "lowReasons"
            ).value =
                item.low || "";

            return;
        }
    }
}

// =====================================================
// SAVE RCA
// =====================================================

async function saveRCA(){

    const parameter =
        document.getElementById(
            "rcaParam"
        ).value;

    const cause_parameter =
        document.getElementById(
            "causeParameter"
        ).value;

    const design =
        document.getElementById(
            "designValue"
        ).value;

    const cause =
        document.getElementById(
            "causeText"
        ).value;

    const high =
        document.getElementById(
            "highReasons"
        ).value;

    const low =
        document.getElementById(
            "lowReasons"
        ).value;

    await fetch("/save_rca", {

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            parameter:parameter,

            cause_parameter:cause_parameter,

            design:design,

            cause:cause,

            high:high,

            low:low
        })
    });

    refreshDatabase();

    alert("RCA Saved");
}

// =====================================================
// DELETE RCA
// =====================================================

async function deleteRCA(){

    const parameter =
        document.getElementById(
            "rcaParam"
        ).value;

    if(!parameter){

        alert("Select RCA");

        return;
    }

    await fetch("/delete_rca", {

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            parameter:parameter
        })
    });

    clearRCAEditor();

    refreshDatabase();
}

// =====================================================
// CLEAR RCA
// =====================================================

function clearRCAEditor(){

    document.getElementById(
        "rcaParam"
    ).value = "";

    document.getElementById(
        "causeParameter"
    ).value = "";

    document.getElementById(
        "designValue"
    ).value = "";

    document.getElementById(
        "causeText"
    ).value = "";

    document.getElementById(
        "highReasons"
    ).value = "";

    document.getElementById(
        "lowReasons"
    ).value = "";
}

// =====================================================
// FILTER RCA
// =====================================================

function filterRCA(){

    const text =
        document.getElementById(
            "rcaSearch"
        ).value
        .toLowerCase();

    const filtered = {};

    for(const p in rcaDatabase){

        const item =
            rcaDatabase[p];

        const combined =
            (
                p + " " +
                (item.cause_parameter || "") + " " +
                (item.cause || "") + " " +
                (item.high || "") + " " +
                (item.low || "")
            ).toLowerCase();

        if(
            combined.includes(text)
        ){

            filtered[p] = item;
        }
    }

    renderRCA(filtered);
}