// =====================================================
// SCADA MOBILE PRO
// COMPLETE UPGRADED APP.JS
// =====================================================

// =====================================================
// DATABASES
// =====================================================

let parameterData = {};
let formulaData = [];
let formDatabase = {};
let rcaDatabase = {};

let currentFormula = null;
let formRows = [];

// =====================================================
// REFRESH DATABASE
// =====================================================

async function refreshDatabase(){

    const response =
        await fetch("/get_database");

    const db =
        await response.json();

    parameterData =
        db.parameters || {};

    formulaData =
        db.formulas || [];

    formDatabase =
        db.forms || {};

    rcaDatabase =
        db.rca || {};

    renderParameters(parameterData);

    renderFormulas(formulaData);

    renderFormulaDropdown();

    renderFormList(formDatabase);

    renderRCA(rcaDatabase);
}

// =====================================================
// PARAMETERS
// =====================================================

function renderParameters(data, filter=""){

    const area =
        document.getElementById(
            "paramList"
        );

    area.innerHTML = "";

    for(const key in data){

        const p = data[key];

        const text =
            `${key} → ${p.name} (${p.unit})`;

        if(
            !text.toLowerCase()
            .includes(filter.toLowerCase())
        ){
            continue;
        }

        const row =
            document.createElement("div");

        row.className =
            "d-flex gap-2 mt-2";

        const btn =
            document.createElement("button");

        btn.className =
            "btn btn-secondary flex-grow-1";

        btn.innerHTML =
            text;

        btn.onclick = () => {

            document.getElementById(
                "paramKey"
            ).value = key;

            document.getElementById(
                "paramName"
            ).value = p.name;

            document.getElementById(
                "paramUnit"
            ).value = p.unit;
        };

        const del =
            document.createElement("button");

        del.className =
            "btn btn-danger";

        del.innerHTML = "X";

        del.onclick = async () => {

            await fetch("/delete_parameter", {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    key:key
                })
            });

            refreshDatabase();
        };

        row.appendChild(btn);
        row.appendChild(del);

        area.appendChild(row);
    }
}

function filterParameters(){

    const text =
        document.getElementById(
            "paramSearch"
        ).value;

    renderParameters(
        parameterData,
        text
    );
}

async function addParameter(){

    const key =
        document.getElementById(
            "paramKey"
        ).value;

    const name =
        document.getElementById(
            "paramName"
        ).value;

    const unit =
        document.getElementById(
            "paramUnit"
        ).value;

    await fetch("/add_parameter", {

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            key:key,
            name:name,
            unit:unit
        })
    });

    refreshDatabase();
}

async function deleteParameter(){

    const key =
        document.getElementById(
            "paramKey"
        ).value;

    if(!key){
        alert("Select Parameter");
        return;
    }

    await fetch("/delete_parameter", {

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({
            key:key
        })
    });

    refreshDatabase();
}

// =====================================================
// FORMULAS
// =====================================================

function renderFormulas(data, filter=""){

    const area =
        document.getElementById(
            "formulaList"
        );

    area.innerHTML = "";

    data.forEach(f => {

        const text =
            `${f.name} → ${f.eq}`;

        if(
            !text.toLowerCase()
            .includes(filter.toLowerCase())
        ){
            return;
        }

        const row =
            document.createElement("div");

        row.className =
            "d-flex gap-2 mt-2";

        const btn =
            document.createElement("button");

        btn.className =
            "btn btn-secondary flex-grow-1";

        btn.innerHTML =
            text;

        btn.onclick = () => {

            document.getElementById(
                "formulaName"
            ).value = f.name;

            document.getElementById(
                "formulaEq"
            ).value = f.eq;
        };

        const del =
            document.createElement("button");

        del.className =
            "btn btn-danger";

        del.innerHTML = "X";

        del.onclick = async () => {

            await fetch("/delete_formula", {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    name:f.name
                })
            });

            refreshDatabase();
        };

        row.appendChild(btn);
        row.appendChild(del);

        area.appendChild(row);
    });
}

function filterFormulas(){

    const text =
        document.getElementById(
            "formulaSearch"
        ).value;

    renderFormulas(
        formulaData,
        text
    );
}

async function addFormula(){

    const name =
        document.getElementById(
            "formulaName"
        ).value;

    const eq =
        document.getElementById(
            "formulaEq"
        ).value;

    await fetch("/add_formula", {

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            name:name,
            eq:eq
        })
    });

    refreshDatabase();
}

async function deleteFormula(){

    const name =
        document.getElementById(
            "formulaName"
        ).value;

    await fetch("/delete_formula", {

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({
            name:name
        })
    });

    refreshDatabase();
}

// =====================================================
// SOLVER
// =====================================================

function renderFormulaDropdown(){

    const dd =
        document.getElementById(
            "formulaSelect"
        );

    dd.innerHTML =
        "<option value=''>Select Formula</option>";

    formulaData.forEach(f => {

        const op =
            document.createElement(
                "option"
            );

        op.value = f.name;
        op.innerHTML = f.name;

        dd.appendChild(op);
    });
}

function loadFormula(){

    const name =
        document.getElementById(
            "formulaSelect"
        ).value;

    currentFormula =
        formulaData.find(
            f => f.name === name
        );

    const area =
        document.getElementById(
            "solverInputs"
        );

    area.innerHTML = "";

    if(!currentFormula)
        return;

    currentFormula.params.forEach(p => {

        const div =
            document.createElement(
                "div"
            );

        const info =
            parameterData[p] || {};

        div.className =
            "mb-2";

        div.innerHTML = `

            <label>
                ${p}
                ${info.name || ""}
                (${info.unit || ""})
            </label>

            <input
                id="solve_${p}"
                class="form-control">
        `;

        area.appendChild(div);
    });
}

async function solveFormula(){

    if(!currentFormula)
        return;

    const vals = {};

    currentFormula.params.forEach(p => {

        vals[p] =
            document.getElementById(
                `solve_${p}`
            ).value;
    });

    const response =
        await fetch("/solve", {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                equation:
                currentFormula.eq,

                values:vals
            })
        });

    const data =
        await response.json();

    document.getElementById(
        "solverResult"
    ).innerHTML = data.result;
}

// =====================================================
// FORM ENGINE
// =====================================================

function addFormRow(data=null){

    const body =
        document.getElementById(
            "formTableBody"
        );

    const tr =
        document.createElement("tr");

    tr.innerHTML = `

        <td>

            <select class="form-select rowType">

                <option>
                    Parameter
                </option>

                <option>
                    Formula
                </option>

            </select>

        </td>

        <td>

            <select class="form-select rowName">
            </select>

        </td>

        <td>

            <input class="form-control rowValue">

        </td>

        <td>

            <button class="btn btn-danger">
                X
            </button>

        </td>
    `;

    body.appendChild(tr);

    formRows.push(tr);

    const typeSelect =
        tr.querySelector(".rowType");

    const nameSelect =
        tr.querySelector(".rowName");

    const valueBox =
        tr.querySelector(".rowValue");

    tr.querySelector("button")
    .onclick = () => {

        tr.remove();

        formRows =
            formRows.filter(
                x => x !== tr
            );
    };

    function updateOptions(){

        nameSelect.innerHTML = "";

        if(
            typeSelect.value ===
            "Parameter"
        ){

            valueBox.readOnly = false;

            for(const key in parameterData){

                const op =
                    document.createElement(
                        "option"
                    );

                op.value = key;

                op.innerHTML =
                    `${key} → ${parameterData[key].name}`;

                nameSelect.appendChild(op);
            }
        }

        else{

            valueBox.readOnly = true;

            formulaData.forEach(f => {

                const op =
                    document.createElement(
                        "option"
                    );

                op.value = f.name;
                op.innerHTML = f.name;

                nameSelect.appendChild(op);
            });
        }

        $(nameSelect).select2({
            width:'100%'
        });
    }

    updateOptions();

    typeSelect.onchange = () => {

        updateOptions();
    };

    nameSelect.onchange = () => {

        if(
            typeSelect.value !==
            "Formula"
        ){
            return;
        }

        const formula =
            formulaData.find(
                f => f.name === nameSelect.value
            );

        if(!formula)
            return;

        formula.params.forEach(p => {

            let exists = false;

            formRows.forEach(r => {

                const t =
                    r.querySelector(
                        ".rowType"
                    ).value;

                const n =
                    r.querySelector(
                        ".rowName"
                    ).value;

                if(
                    t === "Parameter"
                    &&
                    n === p
                ){
                    exists = true;
                }
            });

            if(!exists){

                addFormRow({

                    type:"Parameter",

                    name:p,

                    value:""
                });
            }
        });
    };

    if(data){

        typeSelect.value =
            data.type;

        updateOptions();

        nameSelect.value =
            data.name;

        $(nameSelect).trigger(
            "change"
        );

        valueBox.value =
            data.value || "";
    }
}

async function saveForm(){

    const formName =
        document.getElementById(
            "formName"
        ).value;

    const rows = [];

    formRows.forEach(tr => {

        rows.push({

            type:
            tr.querySelector(
                ".rowType"
            ).value,

            name:
            tr.querySelector(
                ".rowName"
            ).value,

            value:
            tr.querySelector(
                ".rowValue"
            ).value
        });
    });

    await fetch("/save_form", {

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            form_name:formName,
            rows:rows
        })
    });

    alert("Form Saved");

    refreshDatabase();
}

function renderFormList(forms, filter=""){

    const area =
        document.getElementById(
            "formList"
        );

    area.innerHTML = "";

    for(const name in forms){

        if(
            !name.toLowerCase()
            .includes(filter.toLowerCase())
        ){
            continue;
        }

        const row =
            document.createElement("div");

        row.className =
            "d-flex gap-2 mt-2";

        const btn =
            document.createElement("button");

        btn.className =
            "btn btn-secondary flex-grow-1";

        btn.innerHTML =
            name;

        btn.onclick = () => {

            loadForm(name);
        };

        const del =
            document.createElement("button");

        del.className =
            "btn btn-danger";

        del.innerHTML = "X";

        del.onclick = async () => {

            await fetch("/delete_form", {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    name:name
                })
            });

            refreshDatabase();
        };

        row.appendChild(btn);
        row.appendChild(del);

        area.appendChild(row);
    }
}

function filterForms(){

    const text =
        document.getElementById(
            "formSearch"
        ).value;

    renderFormList(
        formDatabase,
        text
    );
}

function loadForm(name){

    document.getElementById(
        "formName"
    ).value = name;

    document.getElementById(
        "formTableBody"
    ).innerHTML = "";

    formRows = [];

    formDatabase[name]
    .forEach(r => {

        addFormRow(r);
    });
}

async function deleteForm(){

    const name =
        document.getElementById(
            "formName"
        ).value;

    await fetch("/delete_form", {

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({
            name:name
        })
    });

    refreshDatabase();
}

async function solveForm(){

    const inputs = {};

    formRows.forEach(tr => {

        const type =
            tr.querySelector(
                ".rowType"
            ).value;

        if(type !== "Parameter")
            return;

        const name =
            tr.querySelector(
                ".rowName"
            ).value;

        const value =
            tr.querySelector(
                ".rowValue"
            ).value;

        inputs[name] = value;
    });

    for(const tr of formRows){

        const type =
            tr.querySelector(
                ".rowType"
            ).value;

        if(type !== "Formula")
            continue;

        const formulaName =
            tr.querySelector(
                ".rowName"
            ).value;

        const formula =
            formulaData.find(
                f => f.name === formulaName
            );

        const valueBox =
            tr.querySelector(
                ".rowValue"
            );

        const response =
            await fetch("/solve", {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    equation:
                    formula.eq,

                    values:inputs
                })
            });

        const data =
            await response.json();

        valueBox.value =
            data.result;
    }
}

// =====================================================
// RCA
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

        btn.innerHTML = p;

        btn.onclick = () => {

            loadRCA(p);
        };

        row.appendChild(btn);

        area.appendChild(row);
    }
}

function loadRCA(parameter){

    const d =
        rcaDatabase[parameter];

    if(!d)
        return;

    document.getElementById(
        "rcaParam"
    ).value =
        parameter;

    document.getElementById(
        "causeParameter"
    ).value =
        d.cause_parameter || "";

    document.getElementById(
        "designValue"
    ).value =
        d.design || "";

    document.getElementById(
        "causeText"
    ).value =
        d.cause || "";

    document.getElementById(
        "highReasons"
    ).value =
        d.high || "";

    document.getElementById(
        "lowReasons"
    ).value =
        d.low || "";
}

function rcaParameterChanged(){

    const parameter =
        document.getElementById(
            "rcaParam"
        ).value
        .trim()
        .toLowerCase();

    for(const p in rcaDatabase){

        if(
            p.toLowerCase()
            === parameter
        ){

            loadRCA(p);

            return;
        }
    }
}

function causeParameterChanged(){

    const cp =
        document.getElementById(
            "causeParameter"
        ).value
        .trim()
        .toLowerCase();

    for(const p in rcaDatabase){

        const item =
            rcaDatabase[p];

        const c =
            (
                item.cause_parameter || ""
            )
            .trim()
            .toLowerCase();

        if(c === cp){

            loadRCA(p);

            return;
        }
    }
}

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

            cause_parameter:
            cause_parameter,

            design:design,

            cause:cause,

            high:high,

            low:low
        })
    });

    refreshDatabase();
}

async function deleteRCA(){

    const parameter =
        document.getElementById(
            "rcaParam"
        ).value;

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

    refreshDatabase();
}

function filterRCA(){

    const text =
        document.getElementById(
            "rcaSearch"
        ).value
        .toLowerCase();

    const filtered = {};

    for(const p in rcaDatabase){

        const d =
            rcaDatabase[p];

        const all =
            JSON.stringify(d)
            .toLowerCase();

        if(
            p.toLowerCase()
            .includes(text)
            ||
            all.includes(text)
        ){

            filtered[p] = d;
        }
    }

    renderRCA(filtered);
}

// =====================================================
// STARTUP
// =====================================================

refreshDatabase();