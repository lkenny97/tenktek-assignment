from flask import Flask, render_template, request

app = Flask(__name__)


def verify(inputA):
    return inputA.isalpha() and len(inputA) == 5


def multiply(inputA, inputB):
    result = '';

    for letter, number in zip(inputA, inputB):
        result += letter * int(number)

    return result


@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == "POST" and verify(request.form['inputA']):
        return multiply(request.form['inputA'], str(request.form['inputB']))
    else:
        return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)