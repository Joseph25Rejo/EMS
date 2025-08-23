import { Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
});

export const metadata = {
  title: 'Explore Art Forms',
  description: 'Discover traditional art forms from different states of India',
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} ${instrumentSerif.variable} bg-white min-h-screen`}>
      {children}
    </div>
  );
}
