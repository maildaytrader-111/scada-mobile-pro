// =====================================================
// GLOBALS
// =====================================================

let currentFormula = null;
let formRows = [];
let rcaData = {};

// =====================================================
// LOAD DATABASE
// =====================================================

window.onload = async function(){

    await refreshDatabase();

    loadRCA();
};

// =====================================================
// REFRESH DATABASE
// =====================================================

async function refreshDatabase(){

    const response =
        await fetch("/get_database");

    const db =
        await response.json();

    renderParameters(db.parameters);

    renderFormulas(db.formulas);
}

// =====================================================
// RENDER PARAMETERS
// =====================================================

function renderParameters(parameters){

    const area =
        document.getElementById("paramList");

    area.innerHTML = "";

    for(const key in parameters){

        const p =
            parameters[key];

        const div =
            document.createElement("div");

        div.className =
            "card p-2 mt-2";

        div.innerHTML = `

            <b>${key}</b>

            <div>
                ${p.name}
            </div>

            <div>
                Unit: ${p.unit}
            </div>
        `;

        area.appendChild(div);
    }
}

// =====================================================
// RENDER FORMULAS
// =====================================================

function renderFormulas(formulas){

    const area =
        document.getElementById("formulaList");

    area.innerHTML = "";

    formulas.forEach(f => {

        const div =
            document.createElement("div");

        div.className =
            "card p-2 mt-2";

        div.innerHTML = `

            <b>${f.name}</b>

            <div>
                ${f.eq}
            </div>
        `;

        area.appendChild(div);
    });
}

// =====================================================
// ADD PARAMETER
// =====================================================

async function addParameter(){

    const key =
        document.getElementById("paramKey").value;

    const name =
        document.getElementById("paramName").value;

    const unit =
        document.getElementById("paramUnit").value;

    await fetch("/add_parameter", {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            key:key,

            name:name,

            unit:unit
        })
    });

    alert("Parameter Added");

    location.reload();
}

// =====================================================
// ADD FORMULA
// =====================================================

async function addFormula(){

    const name =
        document.getElementById("formulaName").value;

    const eq =
        document.getElementById("formulaEq").value;

    await fetch("/add_formula", {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            name:name,

            eq:eq
        })
    });

    alert("Formula Added");

    location.reload();
}

// =====================================================
// LOAD FORMULA
// =====================================================

async function loadFormula(){

    const name =
        document.getElementById("formulaSelect").value;

    const response =
        await fetch("/get_formula/" + name);

    currentFormula =
        await response.json();

    const area =
        document.getElementById("solverInputs");

    area.innerHTML = "";

    currentFormula.params.forEach(p => {

        const div =
            document.createElement("div");

        div.className =
            "mb-2";

        div.innerHTML = `

            <label>${p}</label>

            <input class="form-control"
                   id="input_${p}">
        `;

        area.appendChild(div);
    });
}

// =====================================================
// SOLVE FORMULA
// =====================================================

async function solveFormula(){

    const values = {};

    currentFormula.params.forEach(p => {

        values[p] =
            document.getElementById(
                "input_" + p
            ).value;
    });

    const response =
        await fetch("/solve", {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                equation:currentFormula.eq,

                values:values
            })
        });

    const data =
        await response.json();

    document.getElementById(
        "solverResult"
    ).innerHTML =
        data.result;
}

// =====================================================
// ADD FORM ROW
// =====================================================

function addFormRow(data=null){

    const area =
        document.getElementById("formArea");

    const row =
        document.createElement("div");

    row.className =
        "card p-2 mt-2";

    row.innerHTML = `

        <select class="form-select mb-2 rowType">

            <option>
                Parameter
            </option>

            <option>
                Formula
            </option>

        </select>

        <input class="form-control mb-2 rowName"
               placeholder="Name">

        <input class="form-control rowValue"
               placeholder="Value">

        <button class="btn btn-danger mt-2">
            Delete
        </button>
    `;

    area.appendChild(row);

    const delBtn =
        row.querySelector("button");

    delBtn.onclick = () => {

        row.remove();
    };

    if(data){

        row.querySelector(".rowType").value =
            data.type;

        row.querySelector(".rowName").value =
            data.name;

        row.querySelector(".rowValue").value =
            data.value;
    }

    formRows.push(row);
}

// =====================================================
// SOLVE FORM
// =====================================================

async function solveForm(){

    const dbResponse =
        await fetch("/get_database");

    const db =
        await dbResponse.json();

    const formulas =
        db.formulas;

    const inputs = {};

    // PARAMETERS

    formRows.forEach(row => {

        const type =
            row.querySelector(".rowType").value;

        const name =
            row.querySelector(".rowName").value;

        const value =
            row.querySelector(".rowValue").value;

        if(type === "Parameter"){

            inputs[name] = value;
        }
    });

    // FORMULAS

    for(const row of formRows){

        const type =
            row.querySelector(".rowType").value;

        const name =
            row.querySelector(".rowName").value;

        const valueBox =
            row.querySelector(".rowValue");

        if(type === "Formula"){

            const formula =
                formulas.find(
                    f => f.name === name
                );

            if(!formula)
                continue;

            const response =
                await fetch("/solve", {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        equation:formula.eq,

                        values:inputs
                    })
                });

            const data =
                await response.json();

            valueBox.value =
                data.result;
        }
    }
}

// =====================================================
// SAVE FORM
// =====================================================

async function saveForm(){

    const formName =
        document.getElementById("formName").value;

    const rows = [];

    formRows.forEach(row => {

        rows.push({

            type:
                row.querySelector(".rowType").value,

            name:
                row.querySelector(".rowName").value,

            value:
                row.querySelector(".rowValue").value
        });
    });

    await fetch("/save_form", {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            form_name:formName,

            rows:rows
        })
    });

    alert("Form Saved");

    location.reload();
}

// =====================================================
// LOAD SAVED FORM
// =====================================================

async function loadSavedForm(){

    const name =
        document.getElementById("savedForms").value;

    const response =
        await fetch("/load_form/" + name);

    const rows =
        await response.json();

    document.getElementById(
        "formArea"
    ).innerHTML = "";

    formRows = [];

    rows.forEach(r => {

        addFormRow(r);
    });
}

// =====================================================
// RCA ENGINE
// =====================================================

async function saveRCA(){

    const parameter =
        document.getElementById("rcaParam")
        .value
        .trim();

    if(!parameter){

        alert("Enter parameter");

        return;
    }

    const high =
        document.getElementById("highReasons")
        .value
        .split(",")

        .map(x => x.trim())

        .filter(x => x);

    const low =
        document.getElementById("lowReasons")
        .value
        .split(",")

        .map(x => x.trim())

        .filter(x => x);

    await fetch("/save_rca", {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            parameter:parameter,

            high:high,

            low:low
        })
    });

    alert("RCA Saved");

    clearRCAEditor();

    loadRCA();
}

// =====================================================
// DELETE RCA
// =====================================================

async function deleteRCA(){

    const parameter =
        document.getElementById("rcaParam")
        .value
        .trim();

    if(!parameter){

        alert("Select parameter");

        return;
    }

    await fetch("/delete_rca", {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            parameter:parameter
        })
    });

    alert("RCA Deleted");

    clearRCAEditor();

    loadRCA();
}

// =====================================================
// CLEAR RCA
// =====================================================

function clearRCAEditor(){

    document.getElementById(
        "rcaParam"
    ).value = "";

    document.getElementById(
        "highReasons"
    ).value = "";

    document.getElementById(
        "lowReasons"
    ).value = "";
}

// =====================================================
// LOAD RCA
// =====================================================

async function loadRCA(){

    const response =
        await fetch("/get_rca");

    rcaData =
        await response.json();

    renderRCAList();
}

// =====================================================
// RENDER RCA LIST
// =====================================================

function renderRCAList(filter=""){

    const area =
        document.getElementById("rcaList");

    area.innerHTML = "";

    const mode =
        document.getElementById("rcaMode")
        .value;

    // PARAMETER → CAUSES

    if(mode === "Parameter → Causes"){

        for(const param in rcaData){

            if(
                !param.toLowerCase()
                    .includes(filter.toLowerCase())
            ){
                continue;
            }

            const row =
                document.createElement("div");

            row.className =
                "d-flex gap-2 mt-1";

            const btn =
                document.createElement("button");

            btn.className =
                "btn btn-secondary flex-grow-1";

            btn.innerHTML =
                param;

            btn.onclick = () => {

                showParameterCauses(param);
            };

            const edit =
                document.createElement("button");

            edit.className =
                "btn btn-warning";

            edit.innerHTML =
                "Edit";

            edit.onclick = () => {

                loadRCAIntoEditor(param);
            };

            const del =
                document.createElement("button");

            del.className =
                "btn btn-danger";

            del.innerHTML =
                "X";

            del.onclick = async () => {

                await fetch("/delete_rca", {

                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({

                        parameter:param
                    })
                });

                loadRCA();
            };

            row.appendChild(btn);

            row.appendChild(edit);

            row.appendChild(del);

            area.appendChild(row);
        }
    }

    // CAUSE → PARAMETERS

    else{

        const causes = new Set();

        for(const param in rcaData){

            rcaData[param].high.forEach(
                c => causes.add(c)
            );

            rcaData[param].low.forEach(
                c => causes.add(c)
            );
        }

        causes.forEach(cause => {

            if(
                !cause.toLowerCase()
                    .includes(filter.toLowerCase())
            ){
                return;
            }

            const btn =
                document.createElement("button");

            btn.className =
                "btn btn-info w-100 mt-1";

            btn.innerHTML =
                cause;

            btn.onclick = () => {

                showCauseParameters(cause);
            };

            area.appendChild(btn);
        });
    }
}

// =====================================================
// FILTER RCA
// =====================================================

function filterRCA(){

    const text =
        document.getElementById("rcaSearch")
        .value;

    renderRCAList(text);
}

// =====================================================
// LOAD RCA INTO EDITOR
// =====================================================

function loadRCAIntoEditor(param){

    const data =
        rcaData[param];

    document.getElementById(
        "rcaParam"
    ).value = param;

    document.getElementById(
        "highReasons"
    ).value =
        data.high.join(", ");

    document.getElementById(
        "lowReasons"
    ).value =
        data.low.join(", ");
}

// =====================================================
// SHOW PARAMETER CAUSES
// =====================================================

function showParameterCauses(param){

    const area =
        document.getElementById("rcaResults");

    const data =
        rcaData[param];

    area.innerHTML = `

        <div class="card p-3 mt-2">

            <h4>${param}</h4>

            <hr>

            <h5 class="text-danger">
                HIGH Causes
            </h5>

            <ul>

                ${data.high
                    .map(x => `<li>${x}</li>`)
                    .join("")}

            </ul>

            <h5 class="text-primary">
                LOW Causes
            </h5>

            <ul>

                ${data.low
                    .map(x => `<li>${x}</li>`)
                    .join("")}

            </ul>

        </div>
    `;
}

// =====================================================
// SHOW CAUSE PARAMETERS
// =====================================================

function showCauseParameters(cause){

    const area =
        document.getElementById("rcaResults");

    let html = `

        <div class="card p-3 mt-2">

            <h4>${cause}</h4>

            <hr>
    `;

    for(const param in rcaData){

        if(
            rcaData[param].high.includes(cause)
        ){

            html += `

                <div class="mb-2">

                    🔺 ${param} → HIGH

                </div>
            `;
        }

        if(
            rcaData[param].low.includes(cause)
        ){

            html += `

                <div class="mb-2">

                    🔻 ${param} → LOW

                </div>
            `;
        }
    }

    html += "</div>";

    area.innerHTML = html;
}

// =====================================================
// RCA MODE CHANGE
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        const mode =
            document.getElementById("rcaMode");

        if(mode){

            mode.addEventListener(

                "change",

                () => {

                    renderRCAList();
                }
            );
        }

        loadRCA();
    }
);