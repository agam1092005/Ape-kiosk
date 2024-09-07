'use client';
import { useEffect, useState } from 'react';
import { AnimatedCounter } from 'react-animated-counter';

interface Data {
  CGPA_Details: {
    [key: string]: string;
  };
  Fee_Details: {
    [key: string]: [number, string][];
  };
  Grades: {
    [key: string]: [string, string, string][];
  };
  Personal_Details: {
    [key: string]: string;
  };
  SGPA: number;
  Subject_Details: {
    [key: string]: string;
  };
}

const Home = () => {
  const [data, setData] = useState<Data>({
    CGPA_Details: {},
    Fee_Details: {},
    Grades: {},
    Personal_Details: {},
    SGPA: 0,
    Subject_Details: {}
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const decodedData = JSON.parse(decodeURIComponent(String(urlParams.get('details'))));
    setData(decodedData as Data);
  }, []);


  const getSGPAColor = (sgpa: number) => {
    if (sgpa < 6) return 'red';
    if (sgpa >= 6 && sgpa <= 7.5) return 'orange';
    if (sgpa > 7.5 && sgpa <= 8.5) return 'yellow';
    return 'green';
  };


  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+' || grade === 'A-') return 'text-green-500';
    if (grade === 'B' || grade === 'B-') return 'text-yellow-500';
    if (grade === 'C') return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen text-white p-8">
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex flex-col items-center lg:items-start mb-8 lg:mb-0">
          <h1 className="text-white text-4xl mb-4">SGPA</h1>
          <AnimatedCounter
            value={data.SGPA}
            color={getSGPAColor(Number(data.SGPA))}
            fontSize="100px"
          />
        </div>

        <div className="lg:w-1/2 flex flex-col items-center lg:items-end">
          <h1 className="text-white text-2xl mb-2">{data.Personal_Details['Name']}</h1>
          <h1 className="text-white text-2xl mb-2">{data.Personal_Details['Course']}</h1>
          <h1 className="text-white text-2xl">{data.Personal_Details['Enrollment No.']}</h1>
        </div>
      </div>

      <div className="my-8">
        <h2 className="text-white text-3xl mb-4">This Semester Subject Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(data.Subject_Details).map(([subject, details]) => (
            <div key={subject} className="bg-dgrey p-4 rounded-lg">
              <h3 className="text-xl">{subject}</h3>
              <p className="text-black">{details}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-8">
        <h2 className="text-white text-3xl mb-4">Previous Semester Grades</h2>
        <table className="table-auto w-full bg-dgrey rounded-lg">
          <thead>
            <tr className="bg-black">
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Grade</th>
              <th className="px-4 py-2">Credits</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.Grades).map(([sem, grades]) =>
              grades.map((grade, idx) => (
                <tr key={`${sem}-${idx}`} className="border-b border-black">
                  <td className="px-4 py-2">{grade[0]}</td>
                  <td className={"px-4 py-2"}>{grade[1]}</td>
                  <td className={`px-4 py-2 ${getGradeColor(grade[2])}`}>{grade[2]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="my-8">
        <button
          className="bg-dgrey py-2 px-4 rounded-lg"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {isDropdownOpen ? "Hide Fee & Personal Details" : "Show Fee & Personal Details"}
        </button>
        {isDropdownOpen && (
          <div className="mt-4 bg-dgrey p-4 rounded-lg">
            <h2 className="text-2xl mb-4">Fee Details</h2>
            <table className="table-auto w-full bg-dgrey rounded-lg">
              <thead>
                <tr className="bg-black">
                  <th className="px-4 py-2">Installment</th>
                  <th className="px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.Fee_Details).map(([installment, feeDetails], idx) =>
                  feeDetails.map(([amount, status], feeIdx) => (
                    <tr key={`${installment}-${feeIdx}`} className="border-b border-black">
                      <td className="px-4 py-2">{installment}</td>
                      <td className="px-4 py-2">{amount} - {status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <h2 className="text-2xl mt-6 mb-4">Other Personal Details</h2>
            <p>{data.Personal_Details['Address']}</p>
            <p>{data.Personal_Details['Father\'s Name']}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
