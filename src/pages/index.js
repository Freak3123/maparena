import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Quiz from '@/components/Quiz';

export default function Home() {
  return (
    <div className="">
      <Navbar />
      <div className='flex justify-center'>
      <Quiz />
      </div>
    </div>
  );
}