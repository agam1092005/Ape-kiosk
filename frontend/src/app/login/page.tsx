'use client';
import { useState } from "react";
import HyperText from "@/components/magicui/hyper-text";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';


const WebkioskScraper = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const handleClick = async () => {
    if (!rollNumber || !password) {
      toast.error('Roll Number and Password are mandatory');
      return;
    }

    if (rollNumber.length != 9) {
      toast.error('Invalid Roll Number');
      return;
    }

    toast.loading('Verifying credentials');
    const inputs = {
      "rollNumber": rollNumber,
      "password": password,
      }

    try {
      const response = await fetch('http://localhost:9999/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      })
      const results = await response.json();
      if (response.status === 200)
      {
        const data = results['message'];
        toast.dismiss();
        toast.success('Login Successful');
        const jsonData = JSON.stringify(data);
        const encodedData = encodeURIComponent(jsonData);
        router.push(
        `/home/?details=${encodedData}`,
        );
      }
      else{
        toast.dismiss();
        toast.error(String(results['message']));
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An unexpected error occurred.');
      console.error('Error:', error);
    }
  };

  return (
    <div className='flex flex-col justify-center items-center absolute top-0 left-0 right-0 bottom-0'>
      <img src="main.png" id='main' />
      <div className="pb-8">
        <HyperText
          className="text-3xl font-bold text-white text-center mt-6"
          text="APE KIOSK"
        />
      </div>
      <input className="p-2 m-2" type="text" placeholder="Roll Number" id="username" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}/>
      <input className="p-2 m-2" type="password" placeholder="Password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
      <div className='pt-10'>
        <ShimmerButton onClick={handleClick} className="shadow-1xl">
          <span className="whitespace-pre-wrap text-center text-sm leading-none text-white">
            Login
          </span>
        </ShimmerButton>
      </div>
    </div>
  );
};

export default WebkioskScraper;
