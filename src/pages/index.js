import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Quiz from '@/components/Quiz';
import { Badge } from '@/components/ui/badge';
import data from '@/data/data.json';


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