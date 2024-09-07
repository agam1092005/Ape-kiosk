from flask import Flask, request, jsonify
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

roll_number = None
password = None
scraping_result = {}


def perform_scraping():
    global scraping_result
    try:
        with sync_playwright() as sync:
            browser = sync.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto('https://webkiosk.thapar.edu/index.jsp')
            page.fill('input[name="MemberCode"]', roll_number)
            page.fill('input[name="Password"]', password)
            page.click('input#BTNSubmit')

            if "invalid" in page.content().lower():
                scraping_result = {"error": "Login unsuccessful, invalid credentials."}
                return

            page.goto('https://webkiosk.thapar.edu/StudentFiles/FrameLeftStudent.jsp')
            page.goto('https://webkiosk.thapar.edu/StudentFiles/PersonalFiles/StudPersonalInfo.jsp')
            details = page.inner_html('tbody')
            soup = BeautifulSoup(details, 'html.parser')
            data = soup.find_all(string=True)

            cleaned_data = [item.strip().replace('\xa0', '').replace('\n', '') for item in data if item.strip()]
            cleaned_data = [item for item in cleaned_data if item]

            personalDetails = {
                'Name': cleaned_data[1],
                'Enrollment No.': cleaned_data[3],
                "Father's Name": cleaned_data[5],
                "Mother's Name": cleaned_data[7],
                'Date of Birth': cleaned_data[9],
                'Course': cleaned_data[11] + cleaned_data[12],
                'Semester': cleaned_data[14],
                'Student Mobile': cleaned_data[18],
                'Parent Mobile': cleaned_data[20],
                'Student Email': cleaned_data[26],
                'Parent Email': cleaned_data[28],
                'LMS Initial Password': cleaned_data[36],
                'Mentor Name': cleaned_data[42],
                'Mentor Mobile': cleaned_data[44],
                'Room': cleaned_data[50],
                'Address': f"{cleaned_data[58]}, {cleaned_data[65]}, {cleaned_data[66][1:]}",
            }

            page.goto('https://webkiosk.thapar.edu/StudentFiles/FAS/FeeReceipt.jsp')
            details = page.inner_html('table#table-1.sort-table')
            soup = BeautifulSoup(details, 'html.parser')
            data = soup.find_all(string=True)

            cleaned_data = [item.strip().replace('\xa0', '').replace('\n', '') for item in data if item.strip()]
            cleaned_data = [item for item in cleaned_data if item]

            feeDetails = {}
            i = 0
            while i < len(cleaned_data):
                if "REG" in cleaned_data[i]:
                    reg_type = cleaned_data[i]
                    fee_amount = float(cleaned_data[i + 2])
                    pr_number = cleaned_data[i + 3]

                    if reg_type not in feeDetails:
                        feeDetails[reg_type] = []

                    feeDetails[reg_type].append([fee_amount, pr_number])

                    i += 4
                else:
                    i += 1

            page.goto('https://webkiosk.thapar.edu/StudentFiles/Academic/StudSubjectTaken.jsp')
            details = page.inner_html('table#table-1.sort-table')
            soup = BeautifulSoup(details, 'html.parser')
            data = soup.find_all(string=True)

            cleaned_data = [item.strip().replace('\xa0', '').replace('\n', '') for item in data if item.strip()]
            cleaned_data = [item for item in cleaned_data if item]
            cleaned_data = cleaned_data[4:]

            subDetails = {}
            i = 1
            while i < len(cleaned_data):
                course_name = cleaned_data[i]
                SubCredit = cleaned_data[i + 1]
                course_type = cleaned_data[i + 2]
                subDetails[course_name] = f"{SubCredit} {course_type}"

                i += 4

            page.goto('https://webkiosk.thapar.edu/StudentFiles/Exam/StudentEventGradesView.jsp')
            details = page.inner_html('table#table-1.sort-table')
            soup = BeautifulSoup(details, 'html.parser')
            data = soup.find_all(string=True)

            cleaned_data = [item.strip().replace('\xa0', '').replace('\n', '') for item in data if item.strip()]
            cleaned_data = [item for item in cleaned_data if item]
            cleaned_data = cleaned_data[7:]

            gradeDetails = {}
            for i in range(0, len(cleaned_data), 5):
                course = cleaned_data[i]
                semester = cleaned_data[i + 1]
                score = cleaned_data[i + 2] + '/' + cleaned_data[i + 3]
                grade = cleaned_data[i + 4]

                if semester not in gradeDetails:
                    gradeDetails[semester] = []

                gradeDetails[semester].append([course, score, grade])

            page.goto('https://webkiosk.thapar.edu/StudentFiles/Exam/StudCGPAReport.jsp')
            details = page.inner_html('table#table-1.sort-table')
            soup = BeautifulSoup(details, 'html.parser')
            data = soup.find_all(string=True)

            cleaned_data = [item.strip().replace('\xa0', '').replace('\n', '') for item in data if item.strip()]
            cleaned_data = [item for item in cleaned_data if item]
            cleaned_data = cleaned_data[8:]

            SGPA = 0
            cgDetails = {}
            for i in range(0, len(cleaned_data), 9):
                semester = cleaned_data[i]
                SGPA = cleaned_data[i + 7]
                cgpa = cleaned_data[i + 8]
                cgDetails[semester] = cgpa

            scraping_result = {
                'Personal_Details': personalDetails,
                'Fee_Details': feeDetails,
                'Subject_Details': subDetails,
                'Grades': gradeDetails,
                'CGPA_Details': cgDetails,
                'SGPA': SGPA
            }

    except IndexError:
        scraping_result = "Invalid credentials",

    return scraping_result


@app.route('/login', methods=['POST'])
def login():
    global roll_number, password
    data = request.get_json()
    roll_number = data.get('rollNumber')
    password = data.get('password')

    # if len(roll_number) == 0 or len(password) == 0:
    #     return jsonify({"message": "Roll Number and Password are mandatory"}), 400
    # elif len(roll_number) != 9:
    #     return jsonify({"message": "Invalid Roll Number"}), 400
    if roll_number and password:
        response = perform_scraping()
        if str(response) == "None":
            return jsonify({"message": "Invalid credentials"}), 401
        else:
            if "error" in response:
                return jsonify({"message": "Invalid credentials"}), 401
            else:
                return jsonify({"message": response}), 200


@app.route('/data', methods=['GET'])
def data():
    if scraping_result:
        return jsonify(scraping_result)
    else:
        return jsonify({"message": "Data is not ready yet. Please wait."}), 202


@app.route('/')
def home():
    return "Hello, Flask!"


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=9999)
