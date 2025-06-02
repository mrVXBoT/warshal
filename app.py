from flask import Flask, render_template, request, jsonify
import json
import copy

app = Flask(__name__)

def warshall_algorithm(matrix):
    """
    الگوریتم وارشال برای محاسبه بستار تعدی گراف
    
    ورودی: ماتریس مجاورت گراف (matrix)
    خروجی: بستار تعدی گراف و مراحل محاسبه
    """
    n = len(matrix)
    result = copy.deepcopy(matrix)
    
    # ایجاد آرایه برای ذخیره مراحل
    steps = []
    steps.append({
        "step": 0,
        "matrix": copy.deepcopy(result),
        "description": "ماتریس مجاورت اولیه (R⁰)"
    })
    
    # محاسبه بستار تعدی با الگوریتم وارشال
    # R^k[i][j] = R^(k-1)[i][j] OR (R^(k-1)[i][k] AND R^(k-1)[k][j])
    for k in range(n):
        for i in range(n):
            for j in range(n):
                # اگر از i به k مسیری باشد و از k به j مسیری باشد، پس از i به j هم مسیری وجود دارد
                result[i][j] = result[i][j] or (result[i][k] and result[k][j])
        
        # ذخیره وضعیت ماتریس پس از هر مرحله
        steps.append({
            "step": k + 1,
            "matrix": copy.deepcopy(result),
            "description": f"پس از بررسی رأس {k+1} به عنوان واسطه (R{k+1})"
        })
    
    return result, steps

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    data = request.get_json()
    matrix = data.get('matrix', [])
    
    # تبدیل مقادیر به عدد صحیح برای اطمینان
    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            matrix[i][j] = 1 if matrix[i][j] == 1 else 0
    
    # اجرای الگوریتم وارشال
    result_matrix, steps = warshall_algorithm(matrix)
    
    # توضیحات تکمیلی برای هر مرحله
    for i in range(len(steps)):
        if i == 0:
            steps[i]["math_description"] = "R⁰ = ماتریس مجاورت اولیه"
        else:
            k = i - 1
            steps[i]["math_description"] = f"R{i} = بستار تعدی پس از بررسی رأس {k+1} به عنوان واسطه"
            
    return jsonify({
        'result': result_matrix,
        'steps': steps
    })

if __name__ == '__main__':
    app.run(debug=True) 