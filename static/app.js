// =====================================================
// SCADA MOBILE PRO
// COMPLETE UPGRADED APP.JS
// =====================================================

// =====================================================
// GLOBAL DATABASES
// =====================================================

let parameterData = {};
let formulaData = [];
let formDatabase = {};
let rcaDatabase = {};

let currentFormula = null;
let formRows = [];

// =====================================================
// TOAST
// =====================================================

function toast(msg){

    alert(msg);
}

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
// =====================================================
// PARAMETER ENGINE
// =====================================================
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

        del.innerHTML =
            "X";

        del.onclick = async () => {

            const ok =
                confirm(
                    `Delete parameter "${key}" ?`
                );

            if(!ok) return;

            await fetch(

                "/delete_parameter",

                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({
                        key:key
                    })
                }
            );

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

function clearParameterEditor(){

    document.getElementById(
        "paramKey"
    ).value = "";

    document.getElementById(
        "paramName"
    ).value = "";

    document.getElementById(
        "paramUnit"
    ).value = "";
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

    if(!key || !name){

        toast("Enter parameter details");

        return;
    }

    if(parameterData[key]){

        const ok =
            confirm(
                "Parameter exists. Overwrite?"
            );

        if(!ok) return;
    }

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

    clearParameterEditor();

    refreshDatabase();

    toast("Parameter Saved");
}

async function deleteParameter(){

    const key =
        document.getElementById(
            "paramKey"
        ).value;

    if(!key){

        toast("Select parameter");

        return;
    }

    const ok =
        confirm(
            `Delete parameter "${key}" ?`
        );

    if(!ok) return;

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

    clearParameterEditor();

    refreshDatabase();
}

// =====================================================
// =====================================================
// FORMULA ENGINE
// =====================================================
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

        del.innerHTML =
            "X";

        del.onclick = async () => {

            const ok =
                confirm(
                    `Delete formula "${f.name}" ?`
                );

            if(!ok) return;

            await fetch(

                "/delete_formula",

                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({

                        name:f.name
                    })
                }
            );

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

function clearFormulaEditor(){

    document.getElementById(
        "formulaName"
    ).value = "";

    document.getElementById(
        "formulaEq"
    ).value = "";
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

    if(!name || !eq){

        toast("Enter formula details");

        return;
    }

    const exists =
        formulaData.find(
            f => f.name === name
        );

    if(exists){

        const ok =
            confirm(
                "Formula exists. Overwrite?"
            );

        if(!ok) return;
    }

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

    clearFormulaEditor();

    refreshDatabase();

    toast("Formula Saved");
}

async function deleteFormula(){

    const name =
        document.getElementById(
            "formulaName"
        ).value;

    if(!name){

        toast("Select formula");

        return;
    }

    const ok =
        confirm(
            `Delete formula "${name}" ?`
        );

    if(!ok) return;

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

    clearFormulaEditor();

    refreshDatabase();
}

// =====================================================
// FORMULA DROPDOWN
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

// =====================================================
// LOAD FORMULA
// =====================================================

function loadFormula(){

    const name =
        document.getElementById(
            "formulaSelect"
        ).value;

    const area =
        document.getElementById(
            "solverInputs"
        );

    area.innerHTML = "";

    currentFormula =
        formulaData.find(

            f => f.name === name
        );

    if(!currentFormula)
        return;

    currentFormula.params.forEach(p => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "mb-2";

        const info =
            parameterData[p] || {};

        div.innerHTML = `

            <label>

                ${p}
                ${info.name || ""}
                (${info.unit || ""})

            </label>

            <input id="solve_${p}"
                   class="form-control">
        `;

        area.appendChild(div);
    });
}

// =====================================================
// SOLVE FORMULA
// =====================================================

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
// =====================================================
// FORM ENGINE
// =====================================================
// =====================================================

function clearFormEditor(){

    document.getElementById(
        "formName"
    ).value = "";

    document.getElementById(
        "formTableBody"
    ).innerHTML = "";

    formRows = [];
}

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

    tr.querySelector("button")
    .onclick = () => {

        formRows =
            formRows.filter(r => r !== tr);

        tr.remove();
    };

    const typeSelect =
        tr.querySelector(
            ".rowType"
        );

    const nameSelect =
        tr.querySelector(
            ".rowName"
        );

    const valueBox =
        tr.querySelector(
            ".rowValue"
        );

    function updateOptions(){

        if ($(nameSelect).hasClass("select2-hidden-accessible")) {

            $(nameSelect).select2('destroy');
        }

        nameSelect.innerHTML = "";

        if(typeSelect.value === "Parameter"){

            valueBox.readOnly = false;

            for(const key in parameterData){

                const op =
                    document.createElement(
                        "option"
                    );

                const p =
                    parameterData[key];

                op.value = key;

                op.innerHTML =
                    `${key} → ${p.name}`;

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

        if(typeSelect.value !== "Formula")
            return;

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

            if(exists)
                return;

            addFormRow({

                type:"Parameter",

                name:p,

                value:""
            });
        });
    };

    if(data){

        typeSelect.value =
            data.type;

        updateOptions();

        nameSelect.value =
            data.name;

        $(nameSelect).trigger("change");

        valueBox.value =
            data.value || "";

        if(data.type === "Formula"){

            valueBox.readOnly = true;
        }
    }

    formRows.push(tr);
}

// =====================================================
// SAVE FORM
// =====================================================

async function saveForm(){

    const formName =
        document.getElementById(
            "formName"
        ).value;

    if(!formName){

        toast("Enter form name");

        return;
    }

    const rows = [];

    formRows.forEach(tr => {

        const rowName =
            tr.querySelector(
                ".rowName"
            ).value;

        if(!rowName) return;

        rows.push({

            type:
            tr.querySelector(
                ".rowType"
            ).value,

            name:rowName,

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

    toast("Form Saved");

    refreshDatabase();
}

// =====================================================
// LOAD FORM
// =====================================================

function loadForm(name){

    clearFormEditor();

    document.getElementById(
        "formName"
    ).value = name;

    const rows =
        formDatabase[name];

    if(!rows){

        toast("Form not found");

        return;
    }

    rows.forEach(r => {

        addFormRow(r);
    });
}

// =====================================================
// DELETE FORM
// =====================================================

async function deleteForm(name=null){

    if(!name){

        name =
            document.getElementById(
                "formName"
            ).value;
    }

    if(!name){

        toast("Select form");

        return;
    }

    const ok =
        confirm(
            `Delete form "${name}" ?`
        );

    if(!ok) return;

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

    if(
        document.getElementById(
            "formName"
        ).value === name
    ){
        clearFormEditor();
    }

    refreshDatabase();
}

// =====================================================
// FILTER FORMS
// =====================================================

function filterForms(){

    const text =
        document.getElementById(
            "formSearch"
        ).value
        .toLowerCase();

    renderFormList(
        formDatabase,
        text
    );
}

// =====================================================
// RENDER FORM LIST
// =====================================================

function renderFormList(forms, filter=""){

    const area =
        document.getElementById(
            "formList"
        );

    area.innerHTML = "";

    for(const name in forms){

        if(
            !name.toLowerCase()
            .includes(
                filter.toLowerCase()
            )
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

        del.innerHTML =
            "X";

        del.onclick = () => {

            deleteForm(name);
        };

        row.appendChild(btn);

        row.appendChild(del);

        area.appendChild(row);
    }
}

// =====================================================
// SOLVE FORM
// =====================================================

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

        const valueBox =
            tr.querySelector(
                ".rowValue"
            );

        const formula =
            formulaData.find(

                f => f.name === formulaName
            );

        if(!formula){

            valueBox.value =
                "Formula Not Found";

            continue;
        }

        const response =
            await fetch("/solve", {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
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

        inputs[
            formula.eq.split("=")[0]
            .trim()
        ] = data.result;
    }
}

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

        btn.innerHTML = p;

        btn.onclick = () => {

            document.getElementById(
                "rcaParam"
            ).value = p;

            document.getElementById(
                "highReasons"
            ).value = data[p].high;

            document.getElementById(
                "lowReasons"
            ).value = data[p].low;
        };

        row.appendChild(btn);

        area.appendChild(row);
    }
}

async function saveRCA(){

    const parameter =
        document.getElementById(
            "rcaParam"
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

            high:high,

            low:low
        })
    });

    refreshDatabase();

    toast("RCA Saved");
}

async function deleteRCA(){

    const parameter =
        document.getElementById(
            "rcaParam"
        ).value;

    if(!parameter){

        toast("Select RCA");

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

function filterRCA(){

    const text =
        document.getElementById(
            "rcaSearch"
        ).value
        .toLowerCase();

    const area =
        document.getElementById(
            "rcaList"
        );

    area.innerHTML = "";

    for(const p in rcaDatabase){

        const high =
            (rcaDatabase[p].high || "")
            .toLowerCase();

        const low =
            (rcaDatabase[p].low || "")
            .toLowerCase();

        if(
            !p.toLowerCase().includes(text)
            &&
            !high.includes(text)
            &&
            !low.includes(text)
        ){
            continue;
        }

        const btn =
            document.createElement(
                "button"
            );

        btn.className =
            "btn btn-secondary w-100 mt-2";

        btn.innerHTML = p;

        btn.onclick = () => {

            document.getElementById(
                "rcaParam"
            ).value = p;

            document.getElementById(
                "highReasons"
            ).value = rcaDatabase[p].high;

            document.getElementById(
                "lowReasons"
            ).value = rcaDatabase[p].low;
        };

        area.appendChild(btn);
    }
}

// =====================================================
// STARTUP
// =====================================================

refreshDatabase();