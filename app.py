# app.py
from supabase import create_client
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
import sympy as sp
import json
import os

app = Flask(__name__)
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route("/test")
def test():
    data = supabase.table("parameters").select("*").execute()
    return str(data.data)


# =====================================================
# DATABASE FILE
# =====================================================

DATA_FILE = "scada_auto_save.json"

formula_db = []
param_db = {}
form_db = {}
rca_db = {}

# =====================================================
# LOAD DATABASE
# =====================================================

def load_data():

    global formula_db
    global param_db
    global form_db
    global rca_db

    if os.path.exists(DATA_FILE):

        with open(DATA_FILE, "r") as f:

            data = json.load(f)

            formula_db = data.get(
                "formula_db",
                []
            )

            param_db = data.get(
                "param_db",
                {}
            )

            form_db = data.get(
                "form_db",
                {}
            )

            rca_db = data.get(
                "rca_db",
                {}
            )

# =====================================================
# SAVE DATABASE
# =====================================================

def save_data():

    with open(DATA_FILE, "w") as f:

        json.dump({

            "formula_db": formula_db,

            "param_db": param_db,

            "form_db": form_db,

            "rca_db": rca_db

        }, f, indent=4)

# =====================================================
# EXTRACT PARAMETERS
# =====================================================

def extract_params(eq):

    try:

        expr = eq.replace("=", "-(") + ")"

        parsed = sp.sympify(expr)

        return sorted([

            str(s)

            for s in parsed.free_symbols
        ])

    except:

        return []

# =====================================================
# SMART SOLVER
# =====================================================

def safe_solver(eq_str, inputs):

    try:

        lhs, rhs = eq_str.split("=")

        all_names = set(inputs.keys())

        all_names.update(
            extract_params(eq_str)
        )

        symbols = {

            k: sp.Symbol(k)

            for k in all_names
        }

        lhs_expr = sp.sympify(

            lhs.strip(),

            locals=symbols
        )

        rhs_expr = sp.sympify(

            rhs.strip(),

            locals=symbols
        )

        eq = sp.Eq(

            lhs_expr,

            rhs_expr
        )

        known = {}

        unknown = []

        for k in all_names:

            val = inputs.get(k, "")

            if str(val).strip() == "":

                unknown.append(
                    symbols[k]
                )

            else:

                try:

                    known[
                        symbols[k]
                    ] = float(val)

                except:

                    pass

        # =============================================
        # SINGLE UNKNOWN
        # =============================================

        if len(unknown) == 1:

            target = unknown[0]

            sol = sp.solve(

                eq.subs(known),

                target
            )

            if sol:

                return f"{target} = {round(float(sol[0]), 5)}"

            return "No solution"

        # =============================================
        # NO UNKNOWN
        # =============================================

        elif len(unknown) == 0:

            result = eq.subs(known)

            if result == True:

                return "Equation satisfied"

            return str(result)

        # =============================================
        # MULTIPLE UNKNOWN
        # =============================================

        else:

            return "Missing: " + ", ".join([

                str(x)

                for x in unknown
            ])

    except Exception as e:

        return f"Error: {str(e)}"

# =====================================================
# HOME
# =====================================================

@app.route("/")
def home():

    return render_template(

        "index.html",

        formulas=formula_db,

        parameters=param_db,

        forms=form_db,

        rca=rca_db
    )

# =====================================================
# GET DATABASE
# =====================================================

@app.route("/get_database")
def get_database():

    return jsonify({

        "parameters": param_db,

        "formulas": formula_db,

        "forms": form_db,

        "rca": rca_db
    })

# =====================================================
# ADD / UPDATE PARAMETER
# =====================================================

@app.route("/add_parameter", methods=["POST"])
def add_parameter():

    global param_db

    data = request.json

    key = data["key"]

    param_db[key] = {

        "name": data["name"],

        "unit": data["unit"]
    }

    save_data()

    return jsonify({

        "status":"ok"
    })

# =====================================================
# DELETE PARAMETER
# =====================================================

@app.route("/delete_parameter", methods=["POST"])
def delete_parameter():

    global param_db

    data = request.json

    key = data["key"]

    if key in param_db:

        del param_db[key]

    save_data()

    return jsonify({

        "status":"ok"
    })

# =====================================================
# ADD / UPDATE FORMULA
# =====================================================

@app.route("/add_formula", methods=["POST"])
def add_formula():

    global formula_db

    data = request.json

    name = data["name"]

    eq = data["eq"]

    params = extract_params(eq)

    # =============================================
    # UPDATE IF EXISTS
    # =============================================

    updated = False

    for f in formula_db:

        if f["name"] == name:

            f["eq"] = eq

            f["params"] = params

            updated = True

            break

    # =============================================
    # NEW FORMULA
    # =============================================

    if not updated:

        formula_db.append({

            "name": name,

            "eq": eq,

            "params": params
        })

    save_data()

    return jsonify({

        "status":"ok"
    })

# =====================================================
# DELETE FORMULA
# =====================================================

@app.route("/delete_formula", methods=["POST"])
def delete_formula():

    global formula_db

    data = request.json

    name = data["name"]

    formula_db = [

        f for f in formula_db

        if f["name"] != name
    ]

    save_data()

    return jsonify({

        "status":"ok"
    })

# =====================================================
# GET FORMULA
# =====================================================

@app.route("/get_formula/<name>")
def get_formula(name):

    for f in formula_db:

        if f["name"] == name:

            return jsonify(f)

    return jsonify({})

# =====================================================
# SOLVER
# =====================================================

@app.route("/solve", methods=["POST"])
def solve():

    data = request.json

    equation = data["equation"]

    values = data["values"]

    result = safe_solver(

        equation,

        values
    )

    return jsonify({

        "result": result
    })

# =====================================================
# SAVE FORM
# =====================================================

@app.route("/save_form", methods=["POST"])
def save_form():

    global form_db

    data = request.json

    form_name = data["form_name"]

    rows = data["rows"]

    form_db[form_name] = rows

    save_data()

    return jsonify({

        "status":"ok"
    })

# =====================================================
# LOAD FORM
# =====================================================

@app.route("/load_form/<name>")
def load_form(name):

    rows = form_db.get(name, [])

    return jsonify(rows)

# =====================================================
# SAVE RCA
# =====================================================

@app.route("/save_rca", methods=["POST"])
def save_rca():

    global rca_db

    data = request.json

    parameter = data["parameter"]

    rca_db[parameter] = {

        "high": data["high"],

        "low": data["low"]
    }

    save_data()

    return jsonify({

        "status":"ok"
    })

# =====================================================
# GET RCA
# =====================================================

@app.route("/get_rca")
def get_rca():

    return jsonify(rca_db)

# =====================================================
# DELETE RCA
# =====================================================

@app.route("/delete_rca", methods=["POST"])
def delete_rca():

    global rca_db

    data = request.json

    parameter = data["parameter"]

    if parameter in rca_db:

        del rca_db[parameter]

    save_data()

    return jsonify({

        "status":"ok"
    })

# =====================================================
# START SERVER
# =====================================================

if __name__ == "__main__":

    load_data()

    app.run(

        debug=True,

        host="0.0.0.0",

        port=5000
    )